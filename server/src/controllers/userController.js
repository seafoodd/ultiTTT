import prisma from "../../prisma/prismaClient.js";

export const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
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
      return res.status(404).json({ error: "User not found" });
    }

    user.elo = Math.round(user.elo);

    res.status(200).json(user);
    return user;
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
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
      return res.status(404).json({ error: "User not found" });
    }

    user.elo = Math.round(user.elo);

    res.status(200).json(user);
    return user;
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getUserGameHistory = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        gameHistory1: true,
        gameHistory2: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const combinedGames = [...user.gameHistory1, ...user.gameHistory2].map(
      (game) => {
        let gameResult = "tie";
        if (game.winnerId && game.winner)
          gameResult = game.winnerId === user.id ? "win" : "loss";
        return { ...game, gameResult };
      },
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combinedGames);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};
