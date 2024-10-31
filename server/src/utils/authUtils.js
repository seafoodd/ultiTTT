import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js";

export const getUserByToken = async (token) => {
  if (!token) throw new Error("No token provided");

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return reject(new Error("Token verification failed"));

      try {
        const dbUser = await prisma.user.findUnique({
          where: { username: user.username },
        });

        if (!dbUser) return reject(new Error("User not found"));
        resolve(dbUser);
      } catch (error) {
        reject(new Error("Database query failed"));
      }
    });
  });
};