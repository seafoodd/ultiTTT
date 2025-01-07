import { customAlphabet } from "nanoid";
import { redisClient } from "../index.js";
import prisma from "../../prisma/prismaClient.js";

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

export const generateGameId = async (length = 12, maxRetries = 5, retryDelay = 100) => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, length);

  let retries = 0;
  while (retries < maxRetries) {
    const gameId = nanoid();

    try {
      let existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));

      if (!existingGame) {
        existingGame = await prisma.game.findUnique({
          where: { id: gameId },
        });
      }

      if (!existingGame) {
        return gameId;
      }
    } catch (error) {
      console.error("Error checking game ID:", error);
    }

    retries++;
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay)); // Delay between retries
    }
  }

  throw new Error("Failed to generate a unique game ID after multiple retries");
};

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
      board[a].subWinner === board[c].subWinner
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
 * Assigns symbols to players randomly.
 */
export const assignPlayerSymbols = (game) => {
  if (Math.random() > 0.5) {
    [game.players[0], game.players[1]] = [game.players[1], game.players[0]];
  }
  game.players[0].symbol = "X";
  game.players[1].symbol = "O";
};
