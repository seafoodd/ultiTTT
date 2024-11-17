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
new Set();

/**
 * Initializes the socket.io connection and sets up event handlers.
 */
export const initializeSocket = () => {
  io.on("connection", (socket) => {
    // Handle user joining
    socket.on("join", async (token) => {
      try {
        const user = await getUserByToken(token);
        await redisClient.sadd("onlineUsers", user.username);
        socket.username = user.username;
        io.emit("userOnline", user.username); // Notify all clients
        console.log(`${socket.username} has connected`);
      } catch (e) {
        console.error("Token verification failed:", e.message);
        socket.emit("error", "Token verification failed");
      }
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      if (socket.username) {
        console.log(`${socket.username} has disconnected`);
        await redisClient.srem("onlineUsers", socket.username);
        io.emit("userOffline", socket.username); // Notify all clients
      }
    });

    // Handle checking if a user is online
    socket.on("isUserOnline", async (username, callback) => {
      const isOnline = await redisClient.sismember("onlineUsers", username);
      callback(isOnline);
    });

    // Handle user joining a game
    socket.on("joinGame", async (gameId, token) => {
      try {
        const user = await getUserByToken(token);
        const username = user.username;

        let game = JSON.parse(await redisClient.get(`game:${gameId}`));

        if (!game) {
          console.log("No game found");
          socket.emit("error", "No Game found");
          return;
        }

        const existingPlayer = game.players.find(
          (player) => player.username === username,
        );

        if (existingPlayer) {
          await rejoinExistingPlayer(socket, gameId, existingPlayer, game, io);
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
        console.error("Token verification failed:", e.message);
        socket.emit("error", "Token verification failed");
      }
    });

    // Handle search cancel
    socket.on("cancelSearch", async (token, gameType) => {
      try {
        // throws an error if the user is not found
        await getUserByToken(token);

        await removePlayerFromQueue(socket.id, gameType);
        socket.emit("searchCancelled");
      } catch (e) {
        console.error("Token verification failed:", e.message);
        socket.emit("error", "Token verification failed");
      }
    });

    // Handle searching the match
    socket.on("searchMatch", async (token, gameType) => {
      try {
        // throws an error if the user is not found
        const user = await getUserByToken(token);

        if (!user) {
          socket.emit("error", "Token verification failed");
        }
        const player = new Player(socket.id, user.username, user.elo, gameType);
        await addPlayerToQueue(player);

        const match = await findMatch(player, gameType);
        if (match) {
          const [player1, player2] = match;
          const gameId = Date.now().toString();
          const existingGame = JSON.parse(
            await redisClient.get(`game:${gameId}`),
          );

          if (existingGame) {
            socket.emit("error", "The game already exists");
            console.log("the game already exists");
            return;
          }

          const game = createNewGame(gameType);
          await saveGameToRedis(gameId, game);

          await addNewPlayerToGame(socket, gameId, player1.username, game);
          await addNewPlayerToGame(socket, gameId, player2.username, game);

          assignPlayerSymbols(game);
          await startTimer(io, game, gameId, redisClient);

          await saveGameToRedis(gameId, game);
          emitGameState(io, gameId, game);

          io.to(player1.id).emit("matchFound", gameId);
          io.to(player2.id).emit("matchFound", gameId);
        }
      } catch (e) {
        console.error("Token verification failed:", e.message);
        socket.emit("error", "Token verification failed");
      }
    });

    // Handle creating a friendly game
    socket.on("createFriendlyGame", async (token, gameType) => {
      const user = await getUserByToken(token);

      const player = new Player(socket.id, user.username, user.elo, gameType);
      const gameId = `${user.username}-${Date.now()}`;

      const existingGame = JSON.parse(await redisClient.get(`game:${gameId}`));
      if (existingGame) {
        socket.emit("error", "The game already exists");
        console.log("the game already exists");
        return;
      }

      const game = createNewGame(gameType);
      await saveGameToRedis(gameId, game);

      await addNewPlayerToGame(socket, gameId, player.username, game);

      await saveGameToRedis(gameId, game);
      io.to(socket.id).emit("friendlyGameCreated", gameId); // Send the game ID to the player
    });

    // Handle joining a friendly game
    socket.on("joinFriendlyGame", async (gameId, token) => {
      const user = await getUserByToken(token);
      const username = user.username;

      let game = JSON.parse(await redisClient.get(`game:${gameId}`));
      if (!game) {
        socket.emit("error", "No Game found");
        return;
      }

      if (game.players.length < 2) {
        await addNewPlayerToGame(socket, gameId, username, game);
        assignPlayerSymbols(game);
        await startTimer(io, game, gameId, redisClient);

        await saveGameToRedis(gameId, game);
        emitGameState(io, gameId, game);
      } else {
        socket.emit("error", "Game is full");
      }
    });

    // Handle player making a move
    socket.on(
      "makeMove",
      async ({ gameId, subBoardIndex, squareIndex, player }) => {
        let game = JSON.parse(await redisClient.get(`game:${gameId}`));
        if (game) {
          if (isValidMove(game, subBoardIndex, squareIndex, player)) {
            await handleMove(
              io,
              gameId,
              subBoardIndex,
              squareIndex,
              player,
              redisClient,
            );
          } else {
            console.log("Invalid move attempt: ", game);
          }
        }
      },
    );
  });
};

/**
 * Creates a new game object with initial state.
 * takes gameType as props
 * TODO: add isRanked and stuff like this.
 */
const createNewGame = (gameType) => {
  let time = 300;
  if (gameType === "0") {
    time = 3;
  }
  if (gameType === "5") {
    time = 300;
  } else if (gameType === "10") {
    time = 600;
  } else if (gameType === "15") {
    time = 900;
  }

  return {
    board: Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
    players: [],
    moveHistory: [],
    turn: "X",
    currentSubBoard: null,
    timers: {
      X: time,
      O: time,
    },
  };
};

/**
 * Saves the game state to Redis.
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
    }),
  );
};

/**
 * Emits the current game state to all players in the game.
 */
const emitGameState = (io, gameId, game) => {
  io.to(gameId).emit("gameState", {
    board: game.board,
    turn: game.turn,
    moveHistory: game.moveHistory,
    currentSubBoard: game.currentSubBoard,
    players: game.players,
    timers: game.timers,
  });
};

/**
 * Rejoins an existing player to the game.
 */
const rejoinExistingPlayer = async (socket, gameId, existingPlayer, game) => {
  socket.leave(existingPlayer.id);
  existingPlayer.id = socket.id;
  socket.join(gameId);

  emitGameState(io, gameId, game);
  await saveGameToRedis(gameId, game);
};

/**
 * Adds a new player to the game.
 */
const addNewPlayerToGame = async (socket, gameId, username, game) => {
  socket.join(gameId);
  console.log(socket.id);
  game.players.push({ id: socket.id, username });
};
