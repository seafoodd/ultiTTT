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
  console.log(`Adding player to queue: ${JSON.stringify(player)}`);
  const players = await redisClient.zrange(
    `matchmaking:${player.gameType}`,
    0,
    -1,
  );
  console.log(`Current players in queue: ${players.length}`);

  for (const existingPlayer of players) {
    const parsedPlayer = JSON.parse(existingPlayer);
    if (parsedPlayer.username === player.username) {
      console.log(
        `Player already in queue, updating ID: ${parsedPlayer.username}`,
      );
      await redisClient.zrem(`matchmaking:${player.gameType}`, existingPlayer);
      parsedPlayer.id = player.id;
      await redisClient.zadd(
        `matchmaking:${player.gameType}`,
        parsedPlayer.rank,
        JSON.stringify(parsedPlayer),
      );
      console.log(`Updated player in queue: ${JSON.stringify(parsedPlayer)}`);
      return;
    }
  }

  await redisClient.zadd(
    `matchmaking:${player.gameType}`,
    player.rank,
    JSON.stringify(player),
  );
  console.log(`Added new player to queue: ${JSON.stringify(player)}`);
};
/**
 * Removes a player from the matchmaking queue.
 */
const removePlayerFromQueue = async (playerId, gameType) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);
  console.log(await redisClient.zrange(`matchmaking:${gameType}`, 0, -1));

  for (const player of players) {
    const parsedPlayer = JSON.parse(player);
    if (parsedPlayer.id !== playerId) continue;

    await redisClient.zrem(`matchmaking:${gameType}`, player);
    break;
  }

  console.log(await redisClient.zrange(`matchmaking:${gameType}`, 0, -1));
};

/**
 * Removes a player from all the matchmaking queues
 * without knowing the gameType.
 */
const removePlayerFromAllQueues = async (playerId) => {
  const gameTypes = ["0", "5", "10", "15"];

  for (const gameType of gameTypes) {
    const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);
    for (const player of players) {
      const parsedPlayer = JSON.parse(player);
      if (parsedPlayer.id !== playerId) continue;

      await redisClient.zrem(`matchmaking:${gameType}`, player);
      console.log(`Player ${playerId} removed from "${gameType}" queue`);
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
  initialGap = 40,
  maxGap = 400,
  step = 40,
  timeout = 3000,
) => {
  let gap = initialGap;
  let startTime = Date.now();

  while (gap <= maxGap) {
    const minRank = player.rank - gap;
    const maxRank = player.rank + gap;
    const players = await redisClient.zrangebyscore(
      `matchmaking:${gameType}`,
      minRank,
      maxRank,
    );

    for (let i = 0; i < players.length; i++) {
      const player1 = JSON.parse(players[i]);
      for (let j = i + 1; j < players.length; j++) {
        const player2 = JSON.parse(players[j]);
        if (player1.username !== player2.username) {
          await redisClient.zrem(`matchmaking:${gameType}`, players[i]);
          await redisClient.zrem(`matchmaking:${gameType}`, players[j]);
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

export {
  Player,
  addPlayerToQueue,
  removePlayerFromQueue,
  findMatch,
  removePlayerFromAllQueues,
};
