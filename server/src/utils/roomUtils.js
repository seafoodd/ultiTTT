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
 * @param {Object} game - The game object.
 */
export const addNewPlayerToGame = async (socket, gameId, username, game) => {
  socket.join(gameId);
  game.players.push({ username });
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