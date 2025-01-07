import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";
import {
  preventAccountFlooding,
  preventBruteforce,
} from "../utils/rateLimitingUtils.js";

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
  if (!emailRegex.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/; // (alphanumeric and underscores only)
  const maxUsernameLength = 32;
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
    // TODO: add email verification.

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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName,
      },
    });

    const token = jwt.sign(
      { identifier: username, userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({ ...user, token });
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const tokenOptions = rememberMe ? {} : { expiresIn: "24h" };
    const token = jwt.sign(
      { identifier, userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      tokenOptions,
    );

    res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * Verify a token.
 * There's a middleware before this function, that's why it
 * doesn't check anything here.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object used to send back the HTTP response.
 */
export const verifyToken = (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
  return req.user.username;
};
