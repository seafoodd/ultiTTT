import { debugLog } from "./debugUtils.js";
import { saveGameResult } from "./dbUtils.js";
import { redisClient } from "../index.js";

/**
 * All the possible winning patterns
 */
const Patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Checks if there's a winning
 * position on a sub-board
 */
export const checkWin = (board) => {
  for (let i = 0; i < Patterns.length; i++) {
    const [a, b, c] = Patterns[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if there's a tie on a sub-board
 */
export const checkTie = (board) => {
  return board.every((square) => square !== "");
};

/**
 * Checks if there's a winning position
 * on the whole board. If there's no winner,
 * returns null (null is a tie)
 */
export const checkOverallWin = (board) => {
  for (let i = 0; i < Patterns.length; i++) {
    const [a, b, c] = Patterns[i];
    if (
      board[a].subWinner &&
      board[a].subWinner === board[b].subWinner &&
      board[a].subWinner === board[c].subWinner &&
      board[a].subWinner !== "tie"
    ) {
      return board[a].subWinner;
    }
  }
  return null;
};

/**
 * Validates if the move is allowed.
 */
export const isValidMove = (game, subBoardIndex, squareIndex, symbol) => {
  return (
    game.board[subBoardIndex].subWinner === "" &&
    (game.currentSubBoard === null || subBoardIndex === game.currentSubBoard) &&
    game.board[subBoardIndex].squares[squareIndex] === "" &&
    game.turn === symbol
  );
};

/**
 * Finishes the game by saving the result and clearing the timer.
 */
export const finishGame = async (
  game,
  gameId,
  winnerSymbol,
  isRanked,
  status,
) => {
  try {
    await redisClient.del(`game:${gameId}`);
    await saveGameResult(gameId, game, winnerSymbol, isRanked, status);
    debugLog(`saved the game with id ${gameId} (status: ${status})`);
  } catch (e) {
    console.error("Error saving game result:", e);
  }
};
