import jwt from "jsonwebtoken";
import users from "../models/userModel.js";

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (!users[user.username]) return res.sendStatus(404);
    req.user = user;
    next();
  });
};
