import { checkWin, checkTie, checkOverallWin } from "../utils/gameUtils.js";
import users from "../models/userModel.js";
import games from "../models/gameModel.js"

export const handleMove = (game, subBoardIndex, squareIndex, player) => {
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";

  game.moveHistory.push({ subBoardIndex, squareIndex, player });
  // console.log(game.moveHistory)

  if (checkWin(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = player;
  } else if (checkTie(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = "tie";
  }
};

export const handleOverallWin = (io, game, gameId) => {
  const overallWinner = checkOverallWin(game.board);
  const gameResult = {
    board: game.board,
    winner: overallWinner || "none",
    state: overallWinner ? "Won" : "Tie",
    moveHistory: game.moveHistory,
  };

  if (overallWinner || game.board.every((subBoard) => subBoard.subWinner !== "")) {
    io.to(gameId).emit("gameResult", gameResult);

    for (const player of game.players) {
      const user = users[player.username];
      if (user) {
        if (!user.gameHistory) {
          user.gameHistory = [];
        }
        user.gameHistory.push(gameResult);
        console.log(user);
      } else {
        console.error(`Player with username ${player.username} not found in users object.`);
        console.log(gameResult)
      }
    }

    finishGame(io, game, gameId)
  }
};

const finishGame = (io, game, gameId) => {
  io.to(gameId).disconnectSockets(true);
  clearInterval(game.timerInterval);
  delete games[gameId];
}

export const updateCurrentSubBoard = (game, squareIndex) => {
  game.currentSubBoard = squareIndex;
  if (game.board[squareIndex].subWinner !== "") game.currentSubBoard = null;
};

export const startTimer = (io, game, gameId) => {
  game.timerInterval = setInterval(() => {
    if (game.timers[game.turn] > 0) {
      game.timers[game.turn]--;
      io.to(gameId).emit("timerUpdate", game.timers);
    } else {
      io.to(gameId).emit("gameResult", {
        winner: game.turn === "X" ? "O" : "X",
        state: "Won",
      });
      finishGame(io, game, gameId)
    }
  }, 1000);
};
