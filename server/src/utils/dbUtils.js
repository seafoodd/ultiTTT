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
    const [playerX, playerO] = await Promise.all([
      prisma.user.findUnique({ where: { username: game.players[0].username } }),
      prisma.user.findUnique({ where: { username: game.players[1].username } }),
    ]);

    if (!playerX || !playerO) {
      return;
    }

    let playerXEloChange = 0;
    let playerOEloChange = 0;

    if (isRanked) {
      const playerXOutcome =
        overallWinner === game.players[0].symbol ? 1 : overallWinner ? 0 : 0.5;
      const playerOOutcome =
        overallWinner === game.players[1].symbol ? 1 : overallWinner ? 0 : 0.5;

      const {
        newElo: newEloX,
        newRd: newRdX,
        newVol: newVolX,
      } = calculateRatingChange(
        playerX.elo,
        playerX.rd,
        playerX.vol,
        playerO.elo,
        playerO.rd,
        playerXOutcome,
      );
      const {
        newElo: newEloO,
        newRd: newRdO,
        newVol: newVolO,
      } = calculateRatingChange(
        playerO.elo,
        playerO.rd,
        playerO.vol,
        playerX.elo,
        playerX.rd,
        playerOOutcome,
      );

      playerXEloChange = newEloX - playerX.elo;
      playerOEloChange = newEloO - playerO.elo;

      await Promise.all([
        prisma.user.update({
          where: { username: playerX.username },
          data: {
            elo: newEloX,
            rd: newRdX,
            vol: newVolX,
          },
        }),
        prisma.user.update({
          where: { username: playerO.username },
          data: {
            elo: newEloO,
            rd: newRdO,
            vol: newVolO,
          },
        }),
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
        playerX: { connect: { username: playerX.username } },
        playerXElo: playerX.elo,
        playerXEloChange: playerXEloChange,
        playerO: { connect: { username: playerO.username } },
        playerOElo: playerO.elo,
        playerOEloChange: playerOEloChange,
        isRanked: isRanked,
        status: status,
      },
    });
  } catch (error) {
    console.error("Error saving game result:", error);
  }
};
