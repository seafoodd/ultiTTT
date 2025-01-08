import {
  checkOverallWin,
  checkTie,
  checkWin,
  finishGame,
  isValidMove,
} from "../utils/gameUtils.js";
import {
  clearPreciseInterval,
  preciseSetInterval,
} from "../utils/timeUtils.js";
import { emitGameState } from "../utils/socketUtils.js";
import { debugLog } from "../utils/debugUtils.js";
import { io, redisClient } from "../index.js";

/**
 * Handles a player's move in the game.
 * Updates the game state and checks for win/tie conditions.
 */
export const handleMove = async (
  gameId,
  subBoardIndex,
  squareIndex,
  username,
) => {
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (!game) return;
    const player = game.players.find((p) => p.username === username);
    if (!player) return;
    const symbol = player.symbol;

    if (!isValidMove(game, subBoardIndex, squareIndex, symbol)) {
      return;
    }

    game.board[subBoardIndex].squares[squareIndex] = symbol;
    game.turn = game.turn === "X" ? "O" : "X";

    if (game.moveHistory.length > 1) game.timers[symbol] += game.timeIncrement;
    game.moveHistory.push({ subBoardIndex, squareIndex, player: symbol });

    if (checkWin(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = symbol;
    } else if (checkTie(game.board[subBoardIndex].squares)) {
      game.board[subBoardIndex].subWinner = "tie";
    }

    game.currentSubBoard =
      game.board[squareIndex].subWinner === "" ? squareIndex : null;

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

export const handleResign = async (socket, gameId, username) => {
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (!game) return;
    const player = game.players.find((p) => p.username === username);
    if (!player) return;

    if (game.moveHistory.length < 2) {
      await finishGame(game, gameId, null, false, "aborted");
      io.to(gameId).emit("gameResult", {
        winner: "none",
        status: "aborted",
      });
      debugLog("aborted game with id", gameId);
      return;
    }

    const opponent = game.players.find((p) => p.username !== username);
    if (!opponent) return;
    await finishGame(game, gameId, opponent.symbol, game.isRanked, "resign");
    io.to(gameId).emit("gameResult", {
      winner: opponent.symbol,
      status: "resign",
    });
    console.log("resigned game with id", gameId);
  } catch (e) {
    console.error("makeMove error:", e);
    socket.emit("error", e.message);
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
        game,
        gameId,
        overallWinner,
        game.isRanked,
        overallWinner ? "finished" : "tie",
      );
    }
  }
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
      emitGameState(gameId, redisGame); // idk why it's here, maybe remove it later
      await redisClient.set(`game:${gameId}`, JSON.stringify(redisGame));

      io.to(gameId).emit("gameResult", {
        winner: "none",
        status: "aborted",
      });
      await finishGame(redisGame, gameId, null, false, "aborted");
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

    emitGameState(gameId, redisGame);
    io.to(gameId).emit("gameResult", {
      winner: redisGame.turn === "X" ? "O" : "X",
      state: "byTime",
    });
    await finishGame(
      redisGame,
      gameId,
      redisGame.turn === "X" ? "O" : "X",
      redisGame.isRanked,
      "byTime",
    );
  }, 100);
  timerInterval.createdAt = Date.now();
};
