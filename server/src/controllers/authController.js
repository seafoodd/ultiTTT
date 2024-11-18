import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";

export const register = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken." });
    }
    // TODO: add email verification.

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken." });
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
      { username, userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({ ...user, token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const login = async (req, res) => {
  const { username, password, rememberMe } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { username: username }],
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Sorry, we could not find your account." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Wrong password!" });
    }

    const tokenOptions = rememberMe ? {} : { expiresIn: "24h" };
    const token = jwt.sign(
      { username, userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET,
      tokenOptions,
    );

    res.status(200).json({ token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const verifyToken = (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
  return req.user.username;
};