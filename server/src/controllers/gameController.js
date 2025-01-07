import { checkOverallWin, checkTie, checkWin } from "../utils/gameUtils.js";
import prisma from "../../prisma/prismaClient.js";
import {
  clearPreciseInterval,
  preciseSetInterval,
} from "../utils/timeUtils.js";
import { emitGameState } from "../socket.js";
import { debugLog } from "../utils/debugUtils.js";

/**
 * Handles a player's move in the game.
 * Updates the game state and checks for win/tie conditions.
 */
export const handleMove = async (
  io,
  gameId,
  subBoardIndex,
  squareIndex,
  symbol,
  redisClient,
) => {
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    game.board[subBoardIndex].squares[squareIndex] = symbol;
    game.turn = game.turn === "X" ? "O" : "X";

    if (game.moveHistory.length > 1) game.timers[symbol] += game.timeIncrement;
    game.moveHistory.push({ subBoardIndex, squareIndex, player: symbol });

    if (checkWin(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = symbol;
    } else if (checkTie(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = "tie";
    }

    updateCurrentSubBoard(game, squareIndex);

    await redisClient.set(`game:${gameId}`, JSON.stringify(game));

    // for some reason, the game sometimes doesn't get set to the redis,
    // so I retry 5 times (usually it sets from the first retry)
    let retries = 0;
    let redisGame = JSON.parse(await redisClient.get(`game:${gameId}`));
    while (
      redisGame.moveHistory.length !== game.moveHistory.length &&
      retries < 5
    ) {
      await redisClient.set(`game:${gameId}`, JSON.stringify(game));
      retries += 1;
      console.error(
        `RETRY ${retries}`,
        gameId,
        game.moveHistory.length,
        redisGame.moveHistory.length,
      );
      redisGame = JSON.parse(await redisClient.get(`game:${gameId}`));
    }

    io.to(gameId).emit("gameState", {
      board: redisGame.board,
      turn: redisGame.turn,
      moveHistory: redisGame.moveHistory,
      currentSubBoard: redisGame.currentSubBoard,
      players: redisGame.players,
      timers: redisGame.timers,
    });

    await handleOverallWin(io, game, gameId, redisClient);
  } catch (e) {
    console.error("handleMove error:", e);
  }
};

/**
 * Checks for an overall win or tie in the game.
 * If the game is finished, it triggers the end game process.
 */
export const handleOverallWin = async (io, game, gameId, redisClient) => {
  const overallWinner = checkOverallWin(game.board);
  const gameResult = {
    winner: overallWinner || "none",
    state: "finished",
  };

  if (
    overallWinner ||
    game.board.every((subBoard) => subBoard.subWinner !== "")
  ) {
    if (!game.gameFinished) {
      game.gameFinished = true;
      await redisClient.set(`game:${gameId}`, JSON.stringify(game));
      io.to(gameId).emit("gameResult", gameResult);
      await finishGame(
        io,
        game,
        gameId,
        overallWinner,
        redisClient,
        game.isRanked,
        overallWinner ? "finished" : "tie",
      );
    }
  }
};

/**
 * Saves the game result to the database and updates player ELO ratings.
 */
const saveGameResult = async (
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

    if (playerX && playerO) {
      let playerXEloChange = {
        newRating: playerX.elo,
        newRd: playerX.rd,
        newVol: playerX.vol,
      };
      let playerOEloChange = {
        newRating: playerO.elo,
        newRd: playerO.rd,
        newVol: playerO.vol,
      };

      if (isRanked) {
        const playerXOutcome =
          overallWinner === game.players[0].symbol
            ? 1
            : overallWinner
              ? 0
              : 0.5;
        const playerOOutcome =
          overallWinner === game.players[1].symbol
            ? 1
            : overallWinner
              ? 0
              : 0.5;

        playerXEloChange = calculateEloChange(
          playerX.elo,
          playerX.rd,
          playerX.vol,
          playerO.elo,
          playerO.rd,
          playerXOutcome,
        );
        playerOEloChange = calculateEloChange(
          playerO.elo,
          playerO.rd,
          playerO.vol,
          playerX.elo,
          playerX.rd,
          playerOOutcome,
        );

        await Promise.all([
          prisma.user.update({
            where: { username: playerX.username },
            data: {
              elo: playerXEloChange.newRating,
              rd: playerXEloChange.newRd,
              vol: playerXEloChange.newVol,
            },
          }),
          prisma.user.update({
            where: { username: playerO.username },
            data: {
              elo: playerOEloChange.newRating,
              rd: playerOEloChange.newRd,
              vol: playerOEloChange.newVol,
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
          playerXEloChange: playerXEloChange.newRating - playerX.elo,
          playerO: { connect: { username: playerO.username } },
          playerOElo: playerO.elo,
          playerOEloChange: playerOEloChange.newRating - playerO.elo,
          isRanked: isRanked,
          status: status,
        },
      });
    }
  } catch (error) {
    console.error("Error saving game result:", error);
  }
};

/**
 * Finishes the game by saving the result and clearing the timer.
 */
export const finishGame = async (
  io,
  game,
  gameId,
  winnerSymbol,
  redisClient,
  isRanked,
  status,
) => {
  await redisClient.del(`game:${gameId}`);
  await saveGameResult(gameId, game, winnerSymbol, isRanked, status);
  debugLog(`saved the game with id ${gameId} (status: ${status})`);
};

/**
 * Updates the current sub-board based on the last move.
 */
export const updateCurrentSubBoard = (game, squareIndex) => {
  game.currentSubBoard = squareIndex;
  if (game.board[squareIndex].subWinner !== "") game.currentSubBoard = null;
};

/**
 * Starts the game timer and handles timer updates.
 */
export const startTimer = async (io, gameId, redisClient) => {
  const timerInterval = preciseSetInterval(async () => {
    const redisGame = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (!redisGame) return;
    if (!redisGame.timers) return;
    if (redisGame.turn === undefined) return;
    if (timerInterval.gameFinished) return;

    if (redisGame.moveHistory.length < 2) {
      if (!timerInterval.createdAt) return;
      const msSinceStart = Date.now() - timerInterval.createdAt;
      if (msSinceStart < 30 * 1000) return;

      timerInterval.gameFinished = true;
      clearPreciseInterval(timerInterval);
      emitGameState(io, gameId, redisGame); // idk why it's here, maybe remove it later
      await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));

      io.to(gameId).emit("gameResult", {
        winner: "none",
        status: "aborted",
      });
      await finishGame(
        io,
        redisGame,
        gameId,
        null,
        redisClient,
        false,
        "aborted",
      );
      debugLog("aborted game with id", gameId);

      return;
    }

    redisGame.timers[redisGame.turn] -= 100;

    if (redisGame.timers[redisGame.turn] > 0) {
      await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));
      return;
    }

    clearPreciseInterval(timerInterval);

    redisGame.timers[redisGame.turn] = 0;
    await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));

    emitGameState(io, gameId, redisGame);
    io.to(gameId).emit("gameResult", {
      winner: redisGame.turn === "X" ? "O" : "X",
      state: "byTime",
    });
    await finishGame(
      io,
      redisGame,
      gameId,
      redisGame.turn === "X" ? "O" : "X",
      redisClient,
      redisGame.isRanked,
      "byTime",
    );
  }, 100);
  timerInterval.createdAt = Date.now();
};

/**
 * Calculates the ELO change for a player based on the game outcome.
 * I tried making something similar to glicko-2 but i'm too stupid for it
 * TODO: Actually implement glicko-2 elo system.
 */
const calculateEloChange = (
  playerElo,
  playerRd,
  playerVol,
  opponentElo,
  opponentRd,
  outcome,
) => {
  const q = Math.log(10) / 400;
  const g = (rd) =>
    1 / Math.sqrt(1 + (3 * q * q * rd * rd) / (Math.PI * Math.PI));
  const E = (rating, opponentRating, rd) =>
    1 / (1 + Math.pow(10, (-g(rd) * (rating - opponentRating)) / 400));

  const d2 =
    1 /
    (q *
      q *
      g(opponentRd) *
      g(opponentRd) *
      E(playerElo, opponentElo, opponentRd) *
      (1 - E(playerElo, opponentElo, opponentRd)));
  const newVol = Math.min(800, Math.sqrt(playerVol * playerVol + d2));
  const newRd = Math.max(
    120,
    1 / Math.sqrt(1 / (playerRd * playerRd) + 1 / d2),
  );
  const newRating =
    playerElo +
    (q / (1 / (playerRd * playerRd) + 1 / d2)) *
      g(opponentRd) *
      (outcome - E(playerElo, opponentElo, opponentRd));

  return { newRating, newRd, newVol };
};
