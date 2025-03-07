import prisma from "../../prisma/prismaClient.js";

export const getByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await fetchUserByUsername(username);
    if(!user) return res.status(404).send("User not found!");

    return res.status(200).json(user);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Something went wrong." });
  }
};

export const fetchUserByUsername = async (username) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        username: true,
        displayName: true,
        location: true,
        dateOfBirth: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        elo: true,
      },
    });

    if (!user) {
      return null;
    }

    user.elo = Math.round(user.elo);
    return user;
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong.");
  }
};


export const getGameHistory = async (req, res) => {
  const { username } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        username: true,
        gameHistoryX: true,
        gameHistoryO: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const combinedGames = [...user.gameHistoryX, ...user.gameHistoryO].map(
      (game) => {
        let gameResult = "tie";
        if (game.winner)
          gameResult = game.winner === user.username ? "win" : "loss";
        if(game.status === "aborted"){
          gameResult = "aborted"
        }
        return { ...game, gameResult };
      },
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedGames = combinedGames.slice(offset, offset + limit);

    res.status(200).json({
      games: paginatedGames,
      currentPage: page,
      totalPages: Math.ceil(combinedGames.length / limit),
      totalGames: combinedGames.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};