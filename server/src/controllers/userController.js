import prisma from "../../prisma/prismaClient.js";
import { getUserInfo } from "../utils/dbUtils.js";

export const getByUsername = async (req, res) => {
  const { username } = req.params;
  const isOwner = username === req.user.username;

  try {
    const user = await fetchUserByUsername(username, isOwner);
    if (!user) return res.status(404).send("User not found!");

    return res.status(200).json(user);
  } catch (e) {
    return res
      .status(500)
      .json({ error: e.message || "Something went wrong." });
  }
};

export const fetchUserByUsername = async (username, isOwner) => {
  try {
    const user = await getUserInfo(username, {
      profile: true,
      perfs: true,
      private: isOwner
    });
    if (!user) {
      return null;
    }

    console.log(user);
    for (const gameType of ["bullet", "blitz", "rapid", "standard"]) {
      user.perfs[gameType].all =
        user.perfs[gameType].wins +
        user.perfs[gameType].winsR +
        user.perfs[gameType].losses +
        user.perfs[gameType].lossesR +
        user.perfs[gameType].draws +
        user.perfs[gameType].drawsR;
      user.perfs[gameType].allR =
        user.perfs[gameType].winsR +
        user.perfs[gameType].lossesR +
        user.perfs[gameType].drawsR;
    }
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
  const skip = (page - 1) * limit; // Offset calculation

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const games = await prisma.gamePlayer.findMany({
      where: {
        userId: username,
      },
      include: {
        game: {
          select: {
            id: true,
            board: true,
            winner: true,
            moveHistory: true,
            createdAt: true,
            status: true,
            gameType: true,
            duration: true,
            isRated: true,
            players: {
              select: {
                userId: true,
                symbol: true,
                playerElo: true,
                playerEloChange: true,
              },
            },
          },
        },
      },
      skip: skip,
      take: limit,
      orderBy: {
        game: {
          createdAt: "desc",
        },
      },
    });

    const totalGames = await prisma.gamePlayer.count({
      where: {
        userId: username,
      },
    });

    const gamesWithResults = games.map((gamePlayer) => {
      const game = gamePlayer.game;
      let gameResult = "tie";
      if (game.winner) {
        gameResult = game.winner === user.username ? "win" : "loss";
      }
      if (game.status === "aborted") {
        gameResult = "aborted";
      }
      return { ...game, gameResult };
    });

    res.status(200).json({
      games: gamesWithResults,
      currentPage: page,
      totalPages: Math.ceil(totalGames / limit),
      totalGames: totalGames,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Something went wrong." });
  }
};
