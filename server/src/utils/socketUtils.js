import {debugLog} from "./debugUtils.js";

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
        debugLog(`Acknowledgment received from player ${socket.id}:`, responses);
        acknowledgedPlayers.add(socket.id);
      }
    });
  };

  if (!acknowledgedPlayers.has(socket.id)) {
    attemptEmit(retries);
  }
};