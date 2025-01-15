import { getUserByToken } from "./utils/authUtils.js";
import { handleMove, handleResign } from "./controllers/gameController.js";
import { io } from "./index.js";
import { debugEmitError, debugError, debugLog } from "./utils/debugUtils.js";
import {
  handleConnect,
  handleDisconnect,
  handleIsUserOnline,
} from "./controllers/connectionController.js";
import {
  handleCancelSearch,
  handleCreateFriendlyGame,
  handleDeclineChallenge,
  handleJoinGame,
  handleSearchMatch,
  handleSendChallenge,
} from "./controllers/roomController.js";

/**
 * Initialize socket connections and define event handlers.
 */
export const initializeSocket = () => {
  io.on("connection", async (socket) => {
    debugLog("New connection attempt with id:", socket.id);

    const token = socket.handshake.auth.token;

    if (!token) {
      debugEmitError(socket, "error", 401, "Token is missing");
    }

    let user = null;
    try {
      user = await getUserByToken(token);
      if(!user) return;
      await handleConnect(socket, user);
    } catch (e) {
      debugError("Token verification failed:", e.message);
      debugEmitError(socket, "error", 401, "Invalid token");
      return;
    }

    const requireAuth = (handler) => {
      return (...args) => {
        if (!user) {
          debugEmitError(socket, "error", 403, "Authentication required");
          return;
        }
        handler(...args);
      };
    };
    socket.on(
      "sendChallenge",
      requireAuth((gameType, username) =>
        handleSendChallenge(socket, user, gameType, username),
      ),
    );
    socket.on(
      "declineChallenge",
      requireAuth((gameId, fromUsername) =>
        handleDeclineChallenge(socket, user, gameId, fromUsername),
      ),
    );
    socket.on("disconnect", () => handleDisconnect(socket));
    socket.on("isUserOnline", (username, callback) =>
      handleIsUserOnline(username, callback),
    );
    socket.on(
      "joinGame",
      requireAuth((gameId) => handleJoinGame(socket, gameId)),
    );
    socket.on(
      "cancelSearch",
      requireAuth((gameType) => handleCancelSearch(socket, user, gameType)),
    );
    socket.on(
      "searchMatch",
      requireAuth((gameType) => handleSearchMatch(socket, user, gameType)),
    );
    socket.on(
      "createFriendlyGame",
      requireAuth((gameType) =>
        handleCreateFriendlyGame(socket, user, gameType),
      ),
    );
    socket.on(
      "makeMove",
      requireAuth(({ gameId, subBoardIndex, squareIndex }) =>
        handleMove(gameId, subBoardIndex, squareIndex, user.username),
      ),
    );
    socket.on(
      "resign",
      requireAuth((gameId) => handleResign(socket, gameId, user.username)),
    );
    socket.on("ping", (callback) => {
      callback();
    });
  });
};
