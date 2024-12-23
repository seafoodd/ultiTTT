import { getUserByToken } from "./utils/authUtils.js";
import { handleMove, startTimer } from "./controllers/gameController.js";
import { io, redisClient } from "./index.js";
import {
  addPlayerToQueue,
  findMatch,
  Player,
  removePlayerFromQueue,
  removePlayerFromAllQueues,
} from "./utils/matchmakingUtils.js";
import { assignPlayerSymbols, isValidMove } from "./utils/gameUtils.js";
import { debugEmitError } from "./utils/debugUtils.js";
import { emitToUser } from "./utils/socketUtils.js";

/**
 * Initialize socket connections and define event handlers.
 */
const initializeSocket = () => {
  io.on("connection", async (socket) => {
    console.log("New connection attempt with id:", socket.id);

    const token = socket.handshake.auth.token;

    if (!token) {
      debugEmitError(socket, "error", 401, "Token is missing");
      return;
    }

    let user = null;

    try {
      user = await getUserByToken(token);
      await handleConnect(socket, user);
    } catch (e) {
      console.error("Token verification failed:", e.message);
      socket.emit("error", 401);
      return;
    }

    socket.on("sendChallenge", (gameType, username) =>
      handleSendChallenge(socket, user, gameType, username),
    );
    socket.on("declineChallenge", (gameId, fromUsername) =>
      handleDeclineChallenge(socket, user, gameId, fromUsername),
    );
    socket.on("disconnect", () => handleDisconnect(socket));
    socket.on("isUserOnline", (username, callback) =>
      handleIsUserOnline(username, callback),
    );
    socket.on("joinGame", (gameId) => handleJoinGame(socket, gameId));
    socket.on("cancelSearch", (gameType) =>
      handleCancelSearch(socket, user, gameType),
    );
    socket.on("searchMatch", (gameType) =>
      handleSearchMatch(socket, user, gameType),
    );
    socket.on("createFriendlyGame", (gameType) =>
      handleCreateFriendlyGame(socket, user, gameType),
    );
    socket.on("makeMove", ({ gameId, subBoardIndex, squareIndex }) =>
      handleMakeMove(socket, gameId, subBoardIndex, squareIndex, user.username),
    );
    socket.on("ping", (callback) => {
      callback();
    });
  });
};

/**
 * Handle user connection by adding the user to the online users set and storing the socket ID.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 */
const handleConnect = async (socket, user) => {
  try {
    await redisClient.sadd(`user:${user.username}`, socket.id);
    socket.username = user.username;
    socket.gameRequests = new Set();
    console.log(socket.username, "has connected with id", socket.id);
    io.emit("userOnline", user.username);
  } catch (e) {
    console.error("Connection error:", e);
    socket.emit("error", e.message);
  }
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
    const gameId = `${user.username}-${Date.now()}`;
    const existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (existingGame) {
      socket.emit("error", "The game already exists");
      return;
    }

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
    if (game.players < 2) {
      console.log("del 1");
      await redisClient.del(`game:${gameId}`);
      socket.gameRequests.delete(gameId);
    }

    await emitToUser(socket, fromUsername, "challengeDeclined", { to: socket.username });
  } catch (e) {
    console.error("declineChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle user disconnection by removing user:{username}
 * and removing the user from matchmaking queues
 * @param {Object} socket - The socket object.
 */
const handleDisconnect = async (socket) => {
  if (!socket.username) return;

  try {
    const socketIds = await redisClient.smembers(`user:${socket.username}`);
    if (!socketIds.includes(socket.id)) return;

    await redisClient.srem(`user:${socket.username}`, socket.id);

    if (socketIds.length <= 1) {
      await redisClient.del(`user:${socket.username}`);
      io.emit("userOffline", socket.username);
      await removePlayerFromAllQueues(socket.id);
    }

    console.log(socket.username, "has disconnected with id", socket.id);
  } catch (e) {
    console.error("handleDisconnect error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Check if a user is online.
 * @param {string} username - The username to check.
 * @param {function} callback - The callback function to return the result.
 */
const handleIsUserOnline = async (username, callback) => {
  const isOnline = await redisClient.exists(`user:${username}`);
  callback(isOnline === 1);
};

/**
 * Handle joining a game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 */
const handleJoinGame = async (socket, gameId) => {
  try {
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
      emitGameState(io, gameId, game);
      await saveGameToRedis(gameId, game);
      // console.log(`connected ${username}(${socket.id}) to ${gameId}`);
      return;
    }

    if (
      game.players.length < 2 &&
      game.invitedUsername &&
      game.invitedUsername === username
    ) {
      await addNewPlayerToGame(socket, gameId, username, game);
      // console.log("add new player:", username);
      assignPlayerSymbols(game);
      await startTimer(io, gameId, redisClient);
      await saveGameToRedis(gameId, game);
      emitGameState(io, gameId, game);
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
    await removePlayerFromQueue(socket.id, gameType);
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
    const player = new Player(socket.id, user.username, user.elo, gameType);
    await addPlayerToQueue(player);

    const match = await findMatch(player, gameType);
    if (match) {
      const [player1, player2] = match;
      const gameId = Date.now().toString();
      const existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));

      if (existingGame) {
        socket.emit("error", "The game already exists");
        return;
      }

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

      emitGameState(io, gameId, game);
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
    const player = new Player(socket.id, user.username, user.elo, gameType);
    const gameId = `${user.username}-${Date.now()}`;
    const existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (existingGame) {
      socket.emit("error", "The game already exists");
      return;
    }

    const game = createNewGame(gameType, false);
    await addNewPlayerToGame(socket, gameId, player.username, game);
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    await emitToUser(socket, socket.username, "friendlyGameCreated", gameId);
  } catch (e) {
    console.error("createFriendlyGame error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle making a move in a game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 * @param {number} subBoardIndex - The index of the sub-board.
 * @param {number} squareIndex - The index of the square.
 * @param {string} username - The player making the move.
 */
const handleMakeMove = async (
  socket,
  gameId,
  subBoardIndex,
  squareIndex,
  username,
) => {
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    const player = game.players.find(p => p.username === username)
    if(!player) return;
    const symbol = player.symbol
    console.log(username, player, symbol)
    if (game && isValidMove(game, subBoardIndex, squareIndex, symbol)) {
      await handleMove(
        io,
        gameId,
        subBoardIndex,
        squareIndex,
        symbol,
        redisClient,
      );
    }
  } catch (e) {
    console.error("makeMove error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Create a new game object based on the game type.
 * @param {string} gameType - The type of game.
 * @param isRanked - Is the game ranked?
 * @returns {Object} The new game object.
 */
const createNewGame = (gameType, isRanked = true) => {
  let time = 5 * 60 * 1000;
  let timeIncrement = 0;

  if (gameType === "0") {
    time = 3 * 1000;
  } else if (gameType === "5") {
    time = 5 * 60 * 1000;
    timeIncrement = 3000;
  } else if (gameType === "10") {
    time = 10 * 60 * 1000;
    timeIncrement = 5000;
  } else if (gameType === "15") {
    time = 15 * 60 * 1000;
    timeIncrement = 10000;
  }

  return {
    board: Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
    players: [],
    moveHistory: [],
    turn: "X",
    timeIncrement: timeIncrement,
    currentSubBoard: null,
    timers: { X: time, O: time },
    isRanked: isRanked,
  };
};

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
    }),
  );
};

/**
 * Emit the current game state to all players in the game.
 * @param {Object} io - The socket.io instance.
 * @param {string} gameId - The ID of the game.
 * @param {Object} game - The game object.
 */
export const emitGameState = (io, gameId, game) => {
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

/**
 * Add a new player to the game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 * @param {string} username - The username of the player.
 * @param {Object} game - The game object.
 */
const addNewPlayerToGame = async (socket, gameId, username, game) => {
  socket.join(gameId);
  game.players.push({ username });
};

export { initializeSocket };
