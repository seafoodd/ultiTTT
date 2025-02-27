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
      where: { username },
      select: {
        username: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            location: true,
            bio: true,
          },
        },
        socials: {
          select: {
            youtube: true,
            twitch: true,
            reddit: true,
            discord: true,
            twitter: true,
          },
        },
        perfs: {
          select: {
            bullet: { select: { elo: true } },
            blitz: { select: { elo: true } },
            rapid: { select: { elo: true } },
            standard: { select: { elo: true } },
          },
        },
      },
    });


    console.log(user);
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
  const skip = (page - 1) * limit;  // Offset calculation

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
          createdAt: 'desc',  // Order by latest game first
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


// export const getGameHistory = async (req, res) => {
//   const { username } = req.params;
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const offset = (page - 1) * limit;
//
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         username: username,
//       },
//       select: {
//         username: true,
//         gameHistoryX: true,
//         gameHistoryO: true,
//       },
//     });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//
//     const combinedGames = [...user.gameHistoryX, ...user.gameHistoryO].map(
//       (game) => {
//         let gameResult = "tie";
//         if (game.winner)
//           gameResult = game.winner === user.username ? "win" : "loss";
//         if(game.status === "aborted"){
//           gameResult = "aborted"
//         }
//         return { ...game, gameResult };
//       },
//     ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//
//     const paginatedGames = combinedGames.slice(offset, offset + limit);
//
//     res.status(200).json({
//       games: paginatedGames,
//       currentPage: page,
//       totalPages: Math.ceil(combinedGames.length / limit),
//       totalGames: combinedGames.length,
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: "Something went wrong." });
//   }
// };