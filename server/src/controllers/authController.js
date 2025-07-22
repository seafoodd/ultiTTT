import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";
import {
  preventAccountFlooding,
  preventBruteforce,
} from "../utils/rateLimitingUtils.js";
import { nanoid } from "nanoid";
import {
  disposableDomainsSet,
  sendVerificationEmail,
} from "../utils/emailUtils.js";

/**
 * Register a new user.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object used to send back the HTTP response.
 */
export const register = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domain = email.split("@")[1].toLowerCase().trim();

  if (
    !emailRegex.test(email) ||
    email.length > 254 ||
    disposableDomainsSet.has(domain)
  ) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/; // (alphanumeric and underscores only)
  const maxUsernameLength = 24;
  const minUsernameLength = 3;
  if (username.length < minUsernameLength) {
    return res.status(400).json({
      error: `Username must be at least ${minUsernameLength} characters long`,
    });
  }
  if (username.length > maxUsernameLength) {
    return res.status(400).json({
      error: `Username must not be longer than ${maxUsernameLength} characters`,
    });
  }
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error: "Username must not contain spaces or special characters",
    });
  }

  const passwordRegex = /^.{8,}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const retryAfter = await preventAccountFlooding();
    if (retryAfter) {
      return res
        .status(429)
        .json({ error: `Too many registration requests`, retryAfter });
    }

    const displayName = username;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        displayName,
        email,
        password: hashedPassword,
        socials: {
          create: {},
        },
        perfs: {
          create: {
            bullet: { create: {} },
            blitz: { create: {} },
            rapid: { create: {} },
            standard: { create: {} },
          },
        },
        profile: {
          create: {},
        },
      },
    });

    const token = jwt.sign(
      { identifier: username, t: "verify-email" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    await sendVerificationEmail(username, email, token);

    res.status(201).json({
      message: "Account created successfully. Please verify your email",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * Log in a user.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object used to send back the HTTP response.
 */
export const login = async (req, res) => {
  const retryAfter = await preventBruteforce(req.ip);
  if (retryAfter) {
    return res.status(429).json({ error: `Too many requests`, retryAfter });
  }

  let { identifier, password, rememberMe } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  identifier = identifier.trim();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Invalid username or password" });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Please confirm your email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { identifier: identifier, role: "user" },
      process.env.ACCESS_TOKEN_SECRET,
      rememberMe ? undefined : { expiresIn: "7d" },
    );

    res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const guestLogin = async (req, res) => {
  try {
    const guestId = nanoid();

    const token = jwt.sign(
      { identifier: guestId, role: "guest" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const confirmEmail = async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (user.t !== "verify-email") {
      return res.status(401).json({ error: "Invalid confirmation URL" });
    }
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.identifier }, { username: user.identifier }],
      },
    });
    if (!dbUser) {
      return res.status(401).json({ error: "Invalid confirmation URL" });
    }
    if (dbUser.verified) {
      return res.status(409).json({ error: "The email is already verified" });
    }

    await prisma.user.update({
      where: { username: user.identifier },
      data: {
        verified: true,
      },
    });

    const authToken = jwt.sign(
      { identifier: user.identifier, role: "user" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    return res
      .status(200)
      .json({ message: "Email successfully verified", token: authToken });
  } catch (e) {
    if (e.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid confirmation URL" });
    }

    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Confirmation URL has expired" });
    }

    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};
