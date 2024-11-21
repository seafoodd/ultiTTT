import { getUserByToken } from "./utils/authUtils.js";
import { handleMove, startTimer } from "./controllers/gameController.js";
import { io, redisClient } from "./index.js";
import {
  addPlayerToQueue,
  findMatch,
  Player,
  removePlayerFromQueue,
} from "./utils/matchmakingUtils.js";
import { assignPlayerSymbols, isValidMove } from "./utils/gameUtils.js";
import { debugEmitError } from "./utils/debugUtils.js";

/**
 * Initialize socket connections and define event handlers.
 */
const initializeSocket = () => {
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      debugEmitError(socket, "error", 401, "Token is missing");
      return;
    }

    let user = null;

    try {
      user = await getUserByToken(token);
      await handleUserConnection(socket, user);
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
    socket.on("joinGame", (gameId) => handleJoinGame(socket, user, gameId));
    socket.on("cancelSearch", (gameType) =>
      handleCancelSearch(socket, user, gameType),
    );
    socket.on("searchMatch", (gameType) =>
      handleSearchMatch(socket, user, gameType),
    );
    socket.on("createFriendlyGame", (gameType) =>
      handleCreateFriendlyGame(socket, user, gameType),
    );
    socket.on("makeMove", ({ gameId, subBoardIndex, squareIndex, player }) =>
      handleMakeMove(socket, gameId, subBoardIndex, squareIndex, player),
    );
  });
};

/**
 * Handle user connection by adding the user to the online users set and storing the socket ID.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 */
const handleUserConnection = async (socket, user) => {
  try {
    await redisClient.sadd("onlineUsers", user.username);
    await redisClient.set(`user:${user.username}`, socket.id);
    socket.username = user.username;
    socket.gameRequests = new Set();
    // console.log(socket.username, "has connected");
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
    const player = new Player(socket.id, user.username, user.elo, gameType);
    const gameId = `${user.username}-${Date.now()}`;
    const existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (existingGame) {
      socket.emit("error", "The game already exists");
      return;
    }

    const toSocketId = await redisClient.get(`user:${username}`);
    if (!toSocketId) {
      socket.emit("error", "The user is offline");
      return;
    }

    const game = createNewGame(gameType);
    game.opponentUsername = username;

    await addNewPlayerToGame(socket, gameId, player.username, game);
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    io.to(toSocketId).emit("receiveChallenge", {
      from: user.username,
      gameId,
      gameType,
    });
    io.to(socket.id).emit("challengeCreated", gameId);
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
    if (game.opponentUsername !== user.username) {
      socket.emit("error", "Not Found");
      return;
    }
    if (game.players < 2) {
      await redisClient.del(`game:${gameId}`);
    }
    const fromSocketId = await redisClient.get(`user:${fromUsername}`);
    io.to(fromSocketId).emit("challengeDeclined", { to: socket.username });
  } catch (e) {
    console.error("declineChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle user disconnection by removing the user from the online users set and deleting their games.
 * @param {Object} socket - The socket object.
 */
const handleDisconnect = async (socket) => {
  if (socket.username) {
    // console.log(
    //   `${socket.username} has disconnected with`,
    //   socket.gameRequests,
    // );
    await redisClient.srem("onlineUsers", socket.username);
    await redisClient.del(`user:${socket.username}`);
    for (const gameId of socket.gameRequests) {
      await redisClient.del(`game:${gameId}`);
      // console.log("deleted the game with id:", gameId);
    }
    io.emit("userOffline", socket.username);
  }
};

/**
 * Check if a user is online.
 * @param {string} username - The username to check.
 * @param {function} callback - The callback function to return the result.
 */
const handleIsUserOnline = async (username, callback) => {
  const isOnline = await redisClient.sismember("onlineUsers", username);
  callback(isOnline);
};

/**
 * Handle joining a game.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 * @param {string} gameId - The ID of the game.
 */
const handleJoinGame = async (socket, user, gameId) => {
  try {
    const username = user.username;
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (!game) {
      socket.emit("error", "No Game found");
      return;
    }

    if (game.opponentUsername && game.opponentUsername !== username) return;

    const existingPlayer = game.players.find(
      (player) => player.username === username,
    );
    if (existingPlayer) {
      await rejoinExistingPlayer(socket, gameId, existingPlayer, game);
      emitGameState(io, gameId, game);
      return;
    }

    if (game.players.length < 2) {
      await addNewPlayerToGame(socket, gameId, username, game);
      assignPlayerSymbols(game);
      await startTimer(io, game, gameId, redisClient);
      await saveGameToRedis(gameId, game);
      emitGameState(io, gameId, game);
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
      await saveGameToRedis(gameId, game);

      for (const username of [player1.username, player2.username]) {
        await addNewPlayerToGame(socket, gameId, username, game);
      }

      assignPlayerSymbols(game);
      await startTimer(io, game, gameId, redisClient);
      await saveGameToRedis(gameId, game);
      emitGameState(io, gameId, game);

      for (const id of [player1.id, player2.id]) {
        io.to(id).emit("matchFound", gameId);
      }
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

    const game = createNewGame(gameType);
    await addNewPlayerToGame(socket, gameId, player.username, game);
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    io.to(socket.id).emit("friendlyGameCreated", gameId);
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
 * @param {string} player - The player making the move.
 */
const handleMakeMove = async (
  socket,
  gameId,
  subBoardIndex,
  squareIndex,
  player,
) => {
  try {
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (game && isValidMove(game, subBoardIndex, squareIndex, player)) {
      await handleMove(
        io,
        gameId,
        subBoardIndex,
        squareIndex,
        player,
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
 * @returns {Object} The new game object.
 */
const createNewGame = (gameType) => {
  let time = 300;
  if (gameType === "0") time = 3;
  if (gameType === "5") time = 300;
  else if (gameType === "10") time = 600;
  else if (gameType === "15") time = 900;

  return {
    board: Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
    players: [],
    moveHistory: [],
    turn: "X",
    currentSubBoard: null,
    timers: { X: time, O: time },
  };
};

/**
 * Save the game state to Redis.
 * @param {string} gameId - The ID of the game.
 * @param {Object} game - The game object.
 */
const saveGameToRedis = async (gameId, game) => {
  await redisClient.set(
    `game:${gameId}`,
    JSON.stringify({
      board: game.board,
      turn: game.turn,
      moveHistory: game.moveHistory,
      currentSubBoard: game.currentSubBoard,
      players: game.players,
      timers: game.timers,
      opponentUsername: game.opponentUsername,
      isRanked: true,
    }),
  );
};

/**
 * Emit the current game state to all players in the game.
 * @param {Object} io - The socket.io instance.
 * @param {string} gameId - The ID of the game.
 * @param {Object} game - The game object.
 */
const emitGameState = (io, gameId, game) => {
  io.to(gameId).emit("gameState", {
    board: game.board,
    turn: game.turn,
    moveHistory: game.moveHistory,
    currentSubBoard: game.currentSubBoard,
    players: game.players,
    timers: game.timers,
    opponentUsername: game.opponentUsername,
    isRanked: true,
  });
};

/**
 * Rejoin an existing player to the game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 * @param {Object} existingPlayer - The existing player object.
 * @param {Object} game - The game object.
 */
const rejoinExistingPlayer = async (socket, gameId, existingPlayer, game) => {
  socket.leave(existingPlayer.id);
  existingPlayer.id = socket.id;
  socket.join(gameId);
  emitGameState(io, gameId, game);
  await saveGameToRedis(gameId, game);
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
  game.players.push({ id: socket.id, username });
};

export { initializeSocket };
