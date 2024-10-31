import jwt from "jsonwebtoken";
import prisma from "../../prisma/prismaClient.js"

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    const dbUser = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (!dbUser) return res.sendStatus(404);
    req.user = dbUser;
    next();
  });
};
