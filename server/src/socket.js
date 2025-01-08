import { getUserByToken } from "./utils/authUtils.js";
import {
  handleMove,
  handleResign,
  startTimer,
} from "./controllers/gameController.js";
import { io, redisClient } from "./index.js";
import {
  addPlayerToQueue,
  findMatch,
  Player,
  removePlayerFromQueue,
} from "./utils/matchmakingUtils.js";
import {addNewPlayerToGame, assignPlayerSymbols, createNewGame, generateGameId} from "./utils/roomUtils.js";
import { debugEmitError, debugError, debugLog } from "./utils/debugUtils.js";
import {emitGameState, emitToUser} from "./utils/socketUtils.js";
import {saveGameToRedis} from "./utils/redisUtils.js";
import {handleConnect, handleDisconnect, handleIsUserOnline} from "./controllers/connectionController.js";

/**
 * Initialize socket connections and define event handlers.
 */
const initializeSocket = () => {
  io.on("connection", async (socket) => {
    debugLog("New connection attempt with id:", socket.id);

    const token = socket.handshake.auth.token;

    if (!token) {
      debugEmitError(socket, "error", 401, "Token is missing");
    }

    let user = null;

    try {
      user = await getUserByToken(token);
    } catch (e) {
      debugError("Token verification failed:", e.message);
      debugEmitError(socket, "error", 401, "Invalid token");
    } finally {
      await handleConnect(socket, user);
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

/**
 * Handle sending a challenge to another user.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameType - The type of game.
 * @param {string} username - The username of the challenged user.
 */
const handleSendChallenge = async (socket, user, gameType, username) => {
  try {
    const gameId = await generateGameId(8);
    const game = createNewGame(gameType, false);
    game.invitedUsername = username;

    await addNewPlayerToGame(socket, gameId, user.username, game);
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    await emitToUser(socket, user.username, "challengeCreated", gameId);
    await emitToUser(socket, username, "receiveChallenge", {
      from: user.username,
      gameId,
      gameType,
    });
  } catch (e) {
    console.error("sendChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle declining a challenge.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameId - The ID of the game.
 * @param {string} fromUsername - The username of the user who sent the challenge.
 */
const handleDeclineChallenge = async (socket, user, gameId, fromUsername) => {
  try {
    const game = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (game.invitedUsername !== user.username) {
      socket.emit("error", "Not Found");
      return;
    }
    if (game.players.length < 2) {
      await redisClient.del(`game:${gameId}`);
      socket.gameRequests.delete(gameId);
    }

    await emitToUser(
      socket,
      fromUsername,
      "challengeDeclined",
      socket.username,
    );
  } catch (e) {
    console.error("declineChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle joining a game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 */
const handleJoinGame = async (socket, gameId) => {
  try {
    // console.log(`${socket.username} trying to connect to ${gameId}`);
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (!game) {
      socket.emit("error", "No Game found");
      return;
    }

    const username = socket.username;
    // console.log("join attempt:", username);

    const existingPlayer = game.players.find(
      (player) => player.username === username,
    );

    if (existingPlayer) {
      socket.join(gameId);
      emitGameState(gameId, game);
      await saveGameToRedis(gameId, game);
      // console.log(`connected ${username}(${socket.id}) to ${gameId}`);
      return;
    }

    let canJoin = true;
    if (game.invitedUsername && game.invitedUsername !== username) {
      canJoin = false;
    }

    if (game.players.length < 2 && canJoin) {
      await addNewPlayerToGame(socket, gameId, username, game);
      assignPlayerSymbols(game);
      await startTimer(io, gameId, redisClient);
      await saveGameToRedis(gameId, game);
      emitGameState(gameId, game);
      socket.gameRequests.delete(gameId);
    }
  } catch (e) {
    console.error("joinGame error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle canceling a search for a match.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameType - The type of game.
 */
const handleCancelSearch = async (socket, user, gameType) => {
  try {
    await removePlayerFromQueue(user.username, gameType);
    socket.emit("searchCancelled");
  } catch (e) {
    console.error("cancelSearch error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle searching for a match.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameType - The type of game.
 */
const handleSearchMatch = async (socket, user, gameType) => {
  try {
    const player = new Player(user.username, user.elo);
    await addPlayerToQueue(player, gameType);

    const match = await findMatch(player, gameType);
    if (match) {
      const [player1, player2] = match;
      const gameId = await generateGameId();
      const game = createNewGame(gameType);
      console.log("created new game:", user.username);

      for (const username of [player1.username, player2.username]) {
        await addNewPlayerToGame(socket, gameId, username, game);
      }

      assignPlayerSymbols(game);
      await startTimer(io, gameId, redisClient);
      await saveGameToRedis(gameId, game);

      for (const username of [player1.username, player2.username]) {
        await emitToUser(socket, username, "matchFound", gameId);
      }

      emitGameState(gameId, game);
    }
  } catch (e) {
    console.error("searchMatch error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle creating a friendly game.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameType - The type of game.
 */
const handleCreateFriendlyGame = async (socket, user, gameType) => {
  try {
    const gameId = await generateGameId(8);
    const game = createNewGame(gameType, false);
    await addNewPlayerToGame(socket, gameId, user.username, game);
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    await emitToUser(socket, socket.username, "friendlyGameCreated", gameId);
  } catch (e) {
    console.error("createFriendlyGame error:", e);
    socket.emit("error", e.message);
  }
};

export { initializeSocket };
