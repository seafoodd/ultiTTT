import {redisClient} from '../index.js';
import {debugLog} from './debugUtils.js';

/**
 * Represents a player in the matchmaking queue.
 */
class Player {
  constructor(username, identifier, rank) {
    this.username = username;
    this.identifier = identifier;
    this.rank = rank;
  }
}

/**
 * Adds a player to the matchmaking queue.
 * If the player is already in the queue, updates their ID.
 */
const addPlayerToQueue = async (player, gameType, isRanked) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}${isRanked ? '' : ':unrated'}`, 0, -1);

  const existingPlayer = players.find(
    (p) => JSON.parse(p).identifier === player.identifier
  );
  if (existingPlayer) return;

  await redisClient.zadd(
    `matchmaking:${gameType}${isRanked ? '' : ':unrated'}`,
    isRanked ? player.rank : Date.now(),
    JSON.stringify(player)
  );
};


/**
 * Removes a player from the matchmaking queue.
 */
const removePlayerFromQueue = async (identifier, gameType) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);
  const existingPlayer = players.find(
    (p) => JSON.parse(p).identifier === identifier
  );
  if (!existingPlayer) return;

  await redisClient.zrem(`matchmaking:${gameType}`, existingPlayer);
};

/**
 * Removes a player from all the matchmaking queues
 * without knowing the gameType.
 */
const removePlayerFromAllQueues = async (identifier) => {
  const gameTypes = ['2', '5', '10', '15'];
  debugLog(`removing ${identifier} from all queues...`);
  for (const gameType of gameTypes) {
    await removePlayerFromQueue(identifier, gameType);
    await removePlayerFromQueue(identifier, `${gameType}:unrated`);
  }
};


/**
 * Finds a match for a player within a specified rank gap.
 * Expands the gap incrementally if no match is found within the timeout.
 */
const findMatch = async (
  player,
  gameType,
) => {
  const initialGap = 40;
  const maxGap = 400;
  const step = 40;
  const timeout = 3000;

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
        if (player1.identifier !== player2.identifier) {
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

const findUnratedMatch = async (gameType) => {
  const timeout = 3000;
  const startTime = Date.now();

  while (Date.now() - startTime <= timeout) {
    const players = await redisClient.zrange(`matchmaking:${gameType}:unrated`, 0, -1);

    for (let i = 0; i < players.length; i++) {
      const player1 = JSON.parse(players[i]);
      for (let j = i + 1; j < players.length; j++) {
        const player2 = JSON.parse(players[j]);
        if (player1.identifier !== player2.identifier) {
          await redisClient.zrem(`matchmaking:${gameType}:unrated`, players[i]);
          await redisClient.zrem(`matchmaking:${gameType}:unrated`, players[j]);
          return [player1, player2];
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
};


export {
  Player,
  addPlayerToQueue,
  removePlayerFromQueue,
  findMatch,
  findUnratedMatch,
  removePlayerFromAllQueues,
};
