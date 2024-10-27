import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import users from "../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    users[username] = { userId, username, hashedPassword };
    const token = jwt.sign(
      { username, userId },
      process.env.ACCESS_TOKEN_SECRET,
    );

    res.status(201).json({ token, userId, username, hashedPassword });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong.");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = users[username];
    if (!user) return res.status(404).json({ message: "User not found." });

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      const tokenOptions = rememberMe ? {} : { expiresIn: "1h" };
      const token = jwt.sign(
        { username, userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET,
        tokenOptions,
      );
      return res.status(201).json({ token, username, userId: user.userId });
    }

    res.status(401).json({ error: "Wrong credentials." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const verifyToken = (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
};
