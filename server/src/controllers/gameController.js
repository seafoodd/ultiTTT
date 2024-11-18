import { checkOverallWin, checkTie, checkWin } from "../utils/gameUtils.js";
import prisma from "../../prisma/prismaClient.js";

/**
 * Handles a player's move in the game.
 * Updates the game state and checks for win/tie conditions.
 */
export const handleMove = async (
  io,
  gameId,
  subBoardIndex,
  squareIndex,
  player,
  redisClient,
) => {
  let game = JSON.parse(await redisClient.get(`game:${gameId}`));
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";
  game.moveHistory.push({ subBoardIndex, squareIndex, player });

  if (checkWin(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = player;
  } else if (checkTie(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = "tie";
  }

  updateCurrentSubBoard(game, squareIndex);

  io.to(gameId).emit("gameState", {
    board: game.board,
    turn: game.turn,
    moveHistory: game.moveHistory,
    currentSubBoard: game.currentSubBoard,
    players: game.players,
    timers: game.timers,
  });
  console.log("handleMove");

  await redisClient.set(`game:${gameId}`, JSON.stringify(game));
  await handleOverallWin(io, game, gameId, redisClient);
};

/**
 * Checks for an overall win or tie in the game.
 * If the game is finished, it triggers the end game process.
 */
export const handleOverallWin = async (io, game, gameId, redisClient) => {
  const overallWinner = checkOverallWin(game.board);
  const gameResult = {
    board: game.board,
    winner: overallWinner || "none",
    moveHistory: game.moveHistory,
  };

  if (
    overallWinner ||
    game.board.every((subBoard) => subBoard.subWinner !== "")
  ) {
    if (!game.gameFinished) {
      game.gameFinished = true;
      await redisClient.set(`game:${gameId}`, JSON.stringify(game));
      console.log(game);
      io.to(gameId).emit("gameResult", gameResult);
      await finishGame(io, game, gameId, overallWinner, redisClient);
    }
  }
};

/**
 * Saves the game result to the database and updates player ELO ratings.
 */
const saveGameResult = async (game, overallWinner) => {
  try {
    const [player1, player2] = await Promise.all([
      prisma.user.findUnique({ where: { username: game.players[0].username } }),
      prisma.user.findUnique({ where: { username: game.players[1].username } }),
    ]);

    if (player1 && player2) {
      const player1Outcome =
        overallWinner === game.players[0].symbol ? 1 : overallWinner ? 0 : 0.5;
      const player2Outcome =
        overallWinner === game.players[1].symbol ? 1 : overallWinner ? 0 : 0.5;

      const player1EloChange = calculateEloChange(
        player1.elo,
        player1.rd,
        player1.vol,
        player2.elo,
        player2.rd,
        player1Outcome,
      );
      const player2EloChange = calculateEloChange(
        player2.elo,
        player2.rd,
        player2.vol,
        player1.elo,
        player1.rd,
        player2Outcome,
      );

      const winnerId = overallWinner
        ? overallWinner === game.players[0].symbol
          ? player1.id
          : player2.id
        : null;
      const winnerUsername = overallWinner
        ? overallWinner === game.players[0].symbol
          ? player1.username
          : player2.username
        : null;

      await prisma.game.create({
        data: {
          board: game.board,
          winner: winnerUsername,
          winnerId: winnerId,
          moveHistory: game.moveHistory,
          player1: { connect: { id: player1.id } },
          player1Elo: player1.elo,
          player1EloChange: player1EloChange.newRating - player1.elo,
          player2: { connect: { id: player2.id } },
          player2Elo: player2.elo,
          player2EloChange: player2EloChange.newRating - player2.elo,
        },
      });

      await Promise.all([
        prisma.user.update({
          where: { id: player1.id },
          data: {
            elo: player1EloChange.newRating,
            rd: player1EloChange.newRd,
            vol: player1EloChange.newVol,
          },
        }),
        prisma.user.update({
          where: { id: player2.id },
          data: {
            elo: player2EloChange.newRating,
            rd: player2EloChange.newRd,
            vol: player2EloChange.newVol,
          },
        }),
      ]);
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
) => {
  await saveGameResult(game, winnerSymbol);
  clearInterval(game.timerInterval);
  console.log("deleted the game with id:", gameId);
  await redisClient.del(`game:${gameId}`);
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
 * The code is very confusing because of how timerIntervals are stored.
 * TODO: fix this shit.
 */
export const startTimer = async (io, game, gameId, redisClient) => {
  game.timerInterval = setInterval(async () => {
    const redisGame = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (redisGame && redisGame.timers && redisGame.turn !== undefined) {
      if (redisGame.timers[redisGame.turn] > 0) {
        redisGame.timers[redisGame.turn]--;
        await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));
        io.to(gameId).emit("timerUpdate", redisGame.timers);
      } else {
        if (!game.gameFinished) {
          game.gameFinished = true;
          await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));
          io.to(gameId).emit("gameResult", {
            winner: redisGame.turn === "X" ? "O" : "X",
            state: "Won",
          });
          // clearInterval(game.timerInterval);
          await finishGame(
            io,
            redisGame,
            gameId,
            redisGame.turn === "X" ? "O" : "X",
            redisClient,
          );
        }
      }
    }
  }, 1000);
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
