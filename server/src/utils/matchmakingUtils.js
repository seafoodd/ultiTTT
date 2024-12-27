import { redisClient } from "../index.js";

/**
 * Represents a player in the matchmaking queue.
 */
class Player {
  constructor(username, rank) {
    this.username = username;
    this.rank = rank;
  }
}

/**
 * Adds a player to the matchmaking queue.
 * If the player is already in the queue, updates their ID.
 */
const addPlayerToQueue = async (player, gameType) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);

  const existingPlayer = players.find(
    (p) => JSON.parse(p).username === player.username,
  );
  if (existingPlayer) return;

  // await debugQueue(gameType, `before adding ${player.username}:`)
  await redisClient.zadd(
    `matchmaking:${gameType}`,
    player.rank,
    JSON.stringify(player),
  );
  // await debugQueue(gameType, `after adding ${player.username}:`)
};
/**
 * Removes a player from the matchmaking queue.
 */
const removePlayerFromQueue = async (username, gameType) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);

  const existingPlayer = players.find(
    (p) => JSON.parse(p).username === username,
  );
  if(!existingPlayer) return;

  // await debugQueue(gameType, `before removing ${username}:`)
  await redisClient.zrem(`matchmaking:${gameType}`, existingPlayer);
  // await debugQueue(gameType, `after removing ${username}:`)
};

/**
 * Removes a player from all the matchmaking queues
 * without knowing the gameType.
 */
const removePlayerFromAllQueues = async (username) => {
  const gameTypes = ["0", "5", "10", "15"];
  console.log(`removing ${username} from all queues...`)
  for (const gameType of gameTypes) {
    await removePlayerFromQueue(username, gameType);
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
