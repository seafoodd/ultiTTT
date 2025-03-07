import {io, redisClient} from "../index.js";
import {startTimer} from "../controllers/gameController.js";

/**
 * Save the game state to Redis.
 * @param {string} gameId - The ID of the game.
 * @param {Object} game - The game object.
 */
export const saveGameToRedis = async (gameId, game) => {
    await redisClient.set(
        `game:${gameId}`,
        JSON.stringify({
            board: game.board,
            turn: game.turn,
            moveHistory: game.moveHistory,
            currentSubBoard: game.currentSubBoard,
            players: game.players,
            timers: game.timers,
            timeIncrement: game.timeIncrement,
            invitedUsername: game.invitedUsername,
            isRanked: game.isRanked,
            gameType: game.gameType,
        }),
        "EX",
        3600,
    );
};

export const restartTimers = async () => {
    const keys = await redisClient.keys('game:*');
    for (let key of keys) {
        key = key.split(":")[1];
        console.log("restarting timer for", key)
        await startTimer(io, key, redisClient);
    }
};

export const printAllRedisUsers = async () => {
    try {
        const keys = await redisClient.keys("user:*");
        console.log("online users:",keys)
    } catch (e) {
        console.error("Error fetching usernames:", e.message);
    }
};