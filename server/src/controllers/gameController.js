import { checkWin, checkTie, checkOverallWin } from "../utils/gameUtils.js";

export const handleMove = (game, subBoardIndex, squareIndex, player) => {
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";

  game.moveHistory.push({ subBoardIndex, squareIndex, player });

  if (checkWin(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = player;
  } else if (checkTie(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = "tie";
  }
};

export const handleOverallWin = (io, game, gameId) => {
  const overallWinner = checkOverallWin(game.board);
  if (overallWinner) {
    io.to(gameId).emit("gameResult", {
      winner: overallWinner,
      state: "Won",
    });
  } else if (game.board.every((subBoard) => subBoard.subWinner !== "")) {
    io.to(gameId).emit("gameResult", { winner: "none", state: "Tie" });
  }
};

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
      clearInterval(game.timerInterval);
      io.to(gameId).emit("gameResult", {
        winner: game.turn === "X" ? "O" : "X",
        state: "Won",
      });
    }
  }, 1000);
};
