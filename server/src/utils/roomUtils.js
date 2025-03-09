import { customAlphabet } from "nanoid";
import { redisClient } from "../index.js";
import prisma from "../../prisma/prismaClient.js";

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

/**
 * Add a new player to the game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 * @param {string} username - The username of the player.
 * @param {string} identifier
 * @param {Object} game - The game object.
 */
export const addNewPlayerToGame = async (
  socket,
  gameId,
  username,
  identifier,
  game,
) => {
  socket.join(gameId);
  game.players.push({ username, identifier });
};

export const generateGameId = async (
  length = 12,
  maxRetries = 5,
  retryDelay = 100,
) => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
      await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Delay between retries
    }
  }

  throw new Error("Failed to generate a unique game ID after multiple retries");
};

/**
 * Create a new game object based on the game type.
 * @param {string} gameType - The type of game (minutes).
 * @param isRanked - Is the game ranked?
 * @returns {Object} The new game object.
 */
export const createNewGame = (gameType, isRanked = true) => {
  let time = 1000;
  let timeIncrement = 0;

  switch (gameType) {
    case "bullet":
      time *= 2 * 60;
      timeIncrement = 1000;
      break;
    case "blitz":
      time *= 5 * 60;
      timeIncrement = 3000;
      break;
    case "rapid":
      time *= 10 * 60;
      timeIncrement = 5000;
      break;
    case "standard":
      time *= 15 * 60;
      timeIncrement = 10000;
      break;
  }

  return {
    board: Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
    players: [],
    moveHistory: [],
    turn: "X",
    timeIncrement: timeIncrement,
    currentSubBoard: null,
    timers: { X: time, O: time },
    isRanked: isRanked,
    gameType: gameType,
    startedAt: null,
  };
};
