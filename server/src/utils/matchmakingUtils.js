import { redisClient } from "../index.js";

/**
 * Represents a player in the matchmaking queue.
 */
class Player {
  constructor(id, username, rank, gameType) {
    this.id = id;
    this.username = username;
    this.rank = rank;
    this.gameType = gameType;
  }
}

/**
 * Adds a player to the matchmaking queue.
 * If the player is already in the queue, updates their ID.
 */
const addPlayerToQueue = async (player) => {
  const players = await redisClient.zRange(
    `matchmaking:${player.gameType}`,
    0,
    -1,
  );
  for (const existingPlayer of players) {
    const parsedPlayer = JSON.parse(existingPlayer);
    if (parsedPlayer.username === player.username) {
      await redisClient.zRem(`matchmaking:${player.gameType}`, existingPlayer);
      parsedPlayer.id = player.id;
      await redisClient.zAdd(`matchmaking:${player.gameType}`, {
        score: parsedPlayer.rank,
        value: JSON.stringify(parsedPlayer),
      });
      return;
    }
  }
  await redisClient.zAdd(`matchmaking:${player.gameType}`, {
    score: player.rank,
    value: JSON.stringify(player),
  });
};

/**
 * Removes a player from the matchmaking queue.
 */
const removePlayerFromQueue = async (playerId, gameType) => {
  const players = await redisClient.zRange(`matchmaking:${gameType}`, 0, -1);
  for (const player of players) {
    const parsedPlayer = JSON.parse(player);
    if (parsedPlayer.id === playerId) {
      await redisClient.zRem(`matchmaking:${gameType}`, player);
      break;
    }
  }
};

/**
 * Finds a match for a player within a specified rank gap.
 * Expands the gap incrementally if no match is found within the timeout.
 */
const findMatch = async (
  player,
  gameType,
  initialGap = 50,
  maxGap = 200,
  step = 50,
  timeout = 3000,
) => {
  let gap = initialGap;
  let startTime = Date.now();

  while (gap <= maxGap) {
    const minRank = player.rank - gap;
    const maxRank = player.rank + gap;
    const players = await redisClient.zRangeByScore(
      `matchmaking:${gameType}`,
      minRank,
      maxRank,
    );

    for (let i = 0; i < players.length; i++) {
      const player1 = JSON.parse(players[i]);
      for (let j = i + 1; j < players.length; j++) {
        const player2 = JSON.parse(players[j]);
        if (player1.username !== player2.username) {
          await redisClient.zRem(`matchmaking:${gameType}`, players[i]);
          await redisClient.zRem(`matchmaking:${gameType}`, players[j]);
          return [player1, player2];
        }
      }
    }

    if (Date.now() - startTime > timeout) {
      gap += step;
      startTime = Date.now();
    }
  }

  return null;
};

export { Player, addPlayerToQueue, removePlayerFromQueue, findMatch };
