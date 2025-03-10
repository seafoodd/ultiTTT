import { redisClient } from "../index.js";
import { debugLog } from "./debugUtils.js";

class Player {
  constructor(username, identifier, elo) {
    this.username = username;
    this.identifier = identifier;
    this.elo = elo;
  }
}

const addPlayerToQueue = async (player, gameType, isRated) => {
  await removePlayerFromAllQueues(player.identifier);

  await redisClient.zadd(
    `matchmaking:${gameType}${isRated ? "" : ":unrated"}`,
    isRated ? player.elo : Date.now(),
    JSON.stringify(player),
  );
};

const removePlayerFromQueue = async (identifier, gameType) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);
  const existingPlayer = players.find(
    (p) => JSON.parse(p).identifier === identifier,
  );
  if (!existingPlayer) return;

  await redisClient.zrem(`matchmaking:${gameType}`, existingPlayer);
};

const removePlayerFromAllQueues = async (identifier) => {
  const gameTypes = ["bullet", "blitz", "rapid", "standard"];
  debugLog(`removing ${identifier} from all queues...`);
  for (const gameType of gameTypes) {
    await removePlayerFromQueue(identifier, gameType);
    await removePlayerFromQueue(identifier, `${gameType}:unrated`);
  }
};

const findMatch = async (player, gameType) => {
  const initialGap = 40;
  const maxGap = 400;
  const step = 40;
  const timeout = 3000;
  let gap = initialGap;
  let startTime = Date.now();

  while (gap <= maxGap) {
    const minRank = player.elo - gap;
    const maxRank = player.elo + gap;
    const players = await redisClient.zrangebyscore(
      `matchmaking:${gameType}`,
      minRank,
      maxRank,
    );

    if (players.length < 2) {
      if (Date.now() - startTime > timeout) {
        gap += step;
        startTime = Date.now();
      }
      continue;
    }

    for (let i = 0; i < players.length; i++) {
      const player1 = JSON.parse(players[i]);
      for (let j = i + 1; j < players.length; j++) {
        const player2 = JSON.parse(players[j]);

        const matchKey = `match_lock:${player1.username}:${player2.username}`;

        const lock = await redisClient.set(matchKey, "locked", "NX", "EX", 5);
        if (!lock) {
          console.log("Skipping match creation, already processing.");
          continue;
        }

        await redisClient.zrem(`matchmaking:${gameType}`, players[i]);
        await redisClient.zrem(`matchmaking:${gameType}`, players[j]);

        console.log("Match found! Creating game...");
        return [player1, player2];
      }
    }
  }

  return null;
};

const findUnratedMatch = async (gameType) => {
  const timeout = 3000;
  const startTime = Date.now();
  console.log("finding unrated match");
  while (Date.now() - startTime <= timeout) {
    const players = await redisClient.zrange(
      `matchmaking:${gameType}:unrated`,
      0,
      -1,
    );

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
