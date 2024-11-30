import { checkOverallWin, checkTie, checkWin } from "../utils/gameUtils.js";
import prisma from "../../prisma/prismaClient.js";
import {
  clearPreciseInterval,
  preciseSetInterval,
} from "../utils/timeUtils.js";
import { emitGameState } from "../socket.js";

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
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    game.board[subBoardIndex].squares[squareIndex] = player;
    game.turn = player === "X" ? "O" : "X";

    if (game.moveHistory.length > 1) game.timers[player] += game.timeIncrement;
    game.moveHistory.push({ subBoardIndex, squareIndex, player });

    if (checkWin(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = player;
    } else if (checkTie(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = "tie";
    }

    updateCurrentSubBoard(game, squareIndex);

    await redisClient.set(`game:${gameId}`, JSON.stringify(game));
    // io.to(gameId).emit("gameState", {
    //   board: game.board,
    //   turn: game.turn,
    //   moveHistory: game.moveHistory,
    //   currentSubBoard: game.currentSubBoard,
    //   players: game.players,
    //   timers: game.timers,
    // });
    // const playerSocket = io.sockets.rooms.get(gameId);
    // console.log(io.to(gameId))
    // console.log("Game players:", game.players);
    // const playerSocketIds = game.players.map(player => player.id);
    // console.log("Player socket IDs:", playerSocketIds);
    // emitWithRetry(io.to(gameId), "gameState", {
    //   board: game.board,
    //   turn: game.turn,
    //   moveHistory: game.moveHistory,
    //   currentSubBoard: game.currentSubBoard,
    //   players: game.players,
    //   timers: game.timers,
    // });
    io.to(gameId).emit("gameState", {
        board: game.board,
        turn: game.turn,
        moveHistory: game.moveHistory,
        currentSubBoard: game.currentSubBoard,
        players: game.players,
        timers: game.timers,
    })
    // for (const playerId of playerSocketIds){
    //   const playerSocket = io.sockets.sockets.get(playerId);
    //   emitWithRetry(playerSocket, "gameState", {
    //     board: game.board,
    //     turn: game.turn,
    //     moveHistory: game.moveHistory,
    //     currentSubBoard: game.currentSubBoard,
    //     players: game.players,
    //     timers: game.timers,
    //   });
    // }

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
      // console.log(game);
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
const saveGameResult = async (game, overallWinner, isRanked, status) => {
  try {
    const [player1, player2] = await Promise.all([
      prisma.user.findUnique({ where: { username: game.players[0].username } }),
      prisma.user.findUnique({ where: { username: game.players[1].username } }),
    ]);

    if (player1 && player2) {
      let player1EloChange = {
        newRating: player1.elo,
        newRd: player1.rd,
        newVol: player1.vol,
      };
      let player2EloChange = {
        newRating: player2.elo,
        newRd: player2.rd,
        newVol: player2.vol,
      };

      if (isRanked) {
        const player1Outcome =
          overallWinner === game.players[0].symbol
            ? 1
            : overallWinner
              ? 0
              : 0.5;
        const player2Outcome =
          overallWinner === game.players[1].symbol
            ? 1
            : overallWinner
              ? 0
              : 0.5;

        player1EloChange = calculateEloChange(
          player1.elo,
          player1.rd,
          player1.vol,
          player2.elo,
          player2.rd,
          player1Outcome,
        );
        player2EloChange = calculateEloChange(
          player2.elo,
          player2.rd,
          player2.vol,
          player1.elo,
          player1.rd,
          player2Outcome,
        );

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
  await saveGameResult(game, winnerSymbol, isRanked, status);
  console.log("deleted the game with id:", gameId);
  // console.log(JSON.parse(await redisClient.get(`game:${gameId}`)));
  await redisClient.del(`game:${gameId}`);
  // console.log(JSON.parse(await redisClient.get(`game:${gameId}`)));
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

    if (redisGame && redisGame.timers && redisGame.turn !== undefined) {
      if (redisGame.moveHistory.length > 1)
        redisGame.timers[redisGame.turn] -= 100;
      else {
        if (
          timerInterval.createdAt &&
          !timerInterval.gameFinished &&
          Date.now() - timerInterval.createdAt > 30 * 1000
        ) {
          console.log("aborted game with id", gameId);
          timerInterval.gameFinished = true;
          clearPreciseInterval(timerInterval);
          emitGameState(io, gameId, redisGame);
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
            redisGame.isRanked,
            "aborted",
          );
          return
        }
      }

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
    }
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
