import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js"

export const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.identifier }, { username: user.identifier }],
      },
    });

    if (!dbUser) return res.sendStatus(404);
    req.user = dbUser;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.sendStatus(403);
    }
    console.error("Prisma error:", err);
    return res.sendStatus(500);
  }
};