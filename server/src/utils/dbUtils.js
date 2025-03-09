import prisma from "../../prisma/prismaClient.js";
import { calculateRatingChange } from "./ratingUtils.js";

/**
 * Saves the game result to the database and updates player ELO ratings.
 */
export const saveGameResult = async (
  gameId,
  game,
  overallWinner,
  isRanked,
  status,
) => {
  try {
    const duration = game.startedAt ? Date.now() - game.startedAt : 0;

    console.log("ABSABBABSSASHASJHSJ", game, overallWinner, gameId, isRanked, status)

    const [playerX, playerO] = await Promise.all(
      game.players.map((player) =>
        prisma.user.findUnique({
          where: { username: player.username },
          select: {
            username: true,
            perfs: {
              select: {
                bullet: { select: { elo: true, rd: true, vol: true } },
                blitz: { select: { elo: true, rd: true, vol: true } },
                rapid: { select: { elo: true, rd: true, vol: true } },
                standard: { select: { elo: true, rd: true, vol: true } },
              },
            },
          },
        }),
      ),
    );

    if (!playerX || !playerO) return;

    let playerXEloChange = 0;
    let playerOEloChange = 0;

    const gameType = game.gameType;

    if (status !== "aborted") {
      const [playerXOutcome, playerOOutcome] = [
        overallWinner === game.players[0].symbol ? 1 : overallWinner ? 0 : 0.5,
        overallWinner === game.players[1].symbol ? 1 : overallWinner ? 0 : 0.5,
      ];

      let newEloX, newEloO, newRdX, newRdO, newVolX, newVolO;

      if (isRanked) {
        const {
          newElo: newEloXCalc,
          newRd: newRdXCalc,
          newVol: newVolXCalc,
        } = calculateRatingChange(
          playerX.perfs[gameType].elo,
          playerX.perfs[gameType].rd,
          playerX.perfs[gameType].vol,
          playerO.perfs[gameType].elo,
          playerO.perfs[gameType].rd,
          playerXOutcome,
        );

        const {
          newElo: newEloOCalc,
          newRd: newRdOCalc,
          newVol: newVolOCalc,
        } = calculateRatingChange(
          playerO.perfs[gameType].elo,
          playerO.perfs[gameType].rd,
          playerO.perfs[gameType].vol,
          playerX.perfs[gameType].elo,
          playerX.perfs[gameType].rd,
          playerOOutcome,
        );

        newEloX = newEloXCalc;
        newRdX = newRdXCalc;
        newVolX = newVolXCalc;
        newEloO = newEloOCalc;
        newRdO = newRdOCalc;
        newVolO = newVolOCalc;

        playerXEloChange = newEloX - playerX.perfs[gameType].elo;
        playerOEloChange = newEloO - playerO.perfs[gameType].elo;
      }


      await Promise.all([
        updatePerformance(
          playerX.username,
          gameType,
          playerXOutcome,
          duration,
          newEloX,
          newRdX,
          newVolX,
        ),
        updatePerformance(
          playerO.username,
          gameType,
          playerOOutcome,
          duration,
          newEloO,
          newRdO,
          newVolO,
        ),
      ]);
    }

    const winnerUsername = overallWinner
      ? overallWinner === game.players[0].symbol
        ? playerX.username
        : playerO.username
      : null;

    await prisma.game.create({
      data: {
        id: gameId,
        board: game.board,
        winner: winnerUsername,
        moveHistory: game.moveHistory,
        gameType: gameType,
        players: {
          create: [
            {
              symbol: "X",
              userId: playerX.username,
              playerElo: playerX.perfs[gameType].elo,
              playerEloChange: playerXEloChange,
            },
            {
              symbol: "O",
              userId: playerO.username,
              playerElo: playerO.perfs[gameType].elo,
              playerEloChange: playerOEloChange,
            },
          ],
        },
        duration,
        isRanked,
        status,
      },
    });
  } catch (error) {
    console.error("Error saving game result:", error);
  }
};

const updatePerformance = async (
  username,
  gameType,
  outcome,
  duration,
  newElo = undefined,
  newRd = undefined,
  newVol = undefined,
) => {
  const performance = await prisma.performance.findUnique({
    where: { userId: username },
  });

  if (!performance) {
    throw new Error(`Performance data not found for user: ${username}`);
  }

  const gameTypeMap = {
    blitz: prisma.blitzPerf,
    bullet: prisma.bulletPerf,
    rapid: prisma.rapidPerf,
    standard: prisma.standardPerf,
  };

  const gamePerfModel = gameTypeMap[gameType];

  if (!gamePerfModel) {
    throw new Error(`Unknown game type: ${gameType}`);
  }

  return gamePerfModel.update({
    where: { perfId: performance.id },
    data: {
      elo: newElo,
      rd: newRd,
      vol: newVol,
      playtime: {
        increment: duration,
      },
      wins:
        outcome === 1 && newElo === undefined ? { increment: 1 } : undefined,
      losses:
        outcome === 0 && newElo === undefined ? { increment: 1 } : undefined,
      draws:
        outcome === 0.5 && newElo === undefined ? { increment: 1 } : undefined,
      winsR:
        outcome === 1 && newElo !== undefined ? { increment: 1 } : undefined,
      lossesR:
        outcome === 0 && newElo !== undefined ? { increment: 1 } : undefined,
      drawsR:
        outcome === 0.5 && newElo !== undefined ? { increment: 1 } : undefined,
    },
  });
};

const selectPerformanceFields = ["bullet", "blitz", "rapid", "standard"].reduce(
  (acc, gameType) => {
    acc[gameType] = {
      select: {
        elo: true,
        wins: true,
        winsR: true,
        losses: true,
        lossesR: true,
        draws: true,
        drawsR: true,
        playtime: true,
      },
    };

    return acc;
  },
  {},
);

export const getPublicUserInfo = async (username, fieldsToSelect = {}) => {
  const baseSelect = {};

  if (fieldsToSelect.profile) {
    baseSelect.profile = {
      select: {
        location: true,
        bio: true,
      },
    };

    baseSelect.socials = {
      select: {
        youtube: true,
        twitch: true,
        reddit: true,
        discord: true,
        twitter: true,
      },
    };

    baseSelect.username = true;
    baseSelect.displayName = true;
    baseSelect.createdAt = true;
    baseSelect.updatedAt = true;
  }

  if (fieldsToSelect.perfs) {
    baseSelect.perfs = {
      select: selectPerformanceFields,
    };
  }

  return prisma.user.findUnique({
    where: { username },
    select: baseSelect,
  });
};
