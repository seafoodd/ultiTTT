import prisma from "../../prisma/prismaClient.js";

export const searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({ error: "Query must be at least 3 characters long" });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        username: true,
      },
    });

    res.status(200).json(users.slice(0, 11));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};