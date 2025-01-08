import {debugLog} from "./debugUtils.js";
import {io, redisClient} from "../index.js";

export const emitWithRetry = (socket, event, data, retries = 3, timeout = 1000, acknowledgedPlayers = new Set()) => {
  const attemptEmit = (remainingRetries) => {
    if (remainingRetries <= 0) {
      console.error(`Failed to emit ${event} after multiple attempts`);
      return;
    }

    socket.timeout(timeout).emit(event, data, (error, responses) => {
      if (error) {
        console.error(`Failed to emit ${event} to ${socket.id}:`, error);
        attemptEmit(remainingRetries - 1);
      } else {
        debugLog(`${responses}: ${socket.id}`);
        acknowledgedPlayers.add(socket.id);
      }
    });
  };

  if (!acknowledgedPlayers.has(socket.id)) {
    attemptEmit(retries);
  }
};

export const emitToUser = async (socket, username, event, data) => {
  const toSocketIds = await redisClient.smembers(`user:${username}`);
  if (!toSocketIds || toSocketIds.length === 0) {
    socket.emit("error", "The user is offline or doesn't exist");
    return;
  }

  toSocketIds.forEach((toSocketId) => {
    const playerSocket = io.sockets.sockets.get(toSocketId);
    if (playerSocket) {
      emitWithRetry(playerSocket, event, data);
    }
  });
}

export const emitToGuest = async (socket, event, data) => {
  socket.emit(event, data);
}

/**
 * Emit the current game state to all players in the game.
 * @param {string} gameId - The ID of the game.
 * @param {Object} game - The game object.
 */
export const emitGameState = (gameId, game) => {
    io.to(gameId).emit("gameState", {
      board: game.board,
      turn: game.turn,
      moveHistory: game.moveHistory,
      currentSubBoard: game.currentSubBoard,
      players: game.players,
      timers: game.timers,
      invitedUsername: game.invitedUsername,
      isRanked: game.isRanked,
    });
  };