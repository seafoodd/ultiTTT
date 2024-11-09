import { createClient } from "redis";
import { getUserByToken } from "./utils/authUtils.js";
import { handleMove, startTimer } from "./controllers/gameController.js";

const redisClient = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect();

/**
 * Initializes the socket.io connection and sets up event handlers.
 */
export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    // Handle user joining a game
    socket.on("joinGame", async (gameId, token) => {
      if (!token) {
        console.error("No token provided");
        socket.emit("error", "No token provided");
        return;
      }

      try {
        const user = await getUserByToken(token);
        const username = user.username;

        let game = JSON.parse(await redisClient.get(`game:${gameId}`));

        if (!game) {
          game = createNewGame();
          await saveGameToRedis(gameId, game);
        }

        if (!game.players) {
          game.players = [];
        }

        const existingPlayer = game.players.find(
          (player) => player.username === username,
        );

        if (existingPlayer) {
          await rejoinExistingPlayer(socket, gameId, existingPlayer, game, io);
          return;
        }

        if (game.players.length < 2) {
          await addNewPlayerToGame(socket, gameId, username, game, io);
        }
      } catch (e) {
        console.error("Token verification failed:", e.message);
        socket.emit("error", "Token verification failed");
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

    // Handle sending a message in the game
    socket.on("sendMessage", ({ gameId, message }) => {
      io.to(gameId).emit("message", message);
    });

    // Handle user disconnecting
    socket.on("disconnect", () => {
      // User disconnected
    });
  });
};

/**
 * Creates a new game object with initial state.
 */
const createNewGame = () => ({
  board: Array.from({ length: 9 }, () => ({
    subWinner: "",
    squares: Array(9).fill(""),
  })),
  players: [],
  moveHistory: [],
  turn: "X",
  currentSubBoard: null,
  timers: {
    X: 300,
    O: 300,
  },
});

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
 * Rejoins an existing player to the game.
 */
const rejoinExistingPlayer = async (
  socket,
  gameId,
  existingPlayer,
  game,
) => {
  socket.leave(existingPlayer.id);
  existingPlayer.id = socket.id;
  socket.join(gameId);
  socket.emit("gameState", {
    board: game.board,
    turn: game.turn,
    moveHistory: game.moveHistory,
    currentSubBoard: game.currentSubBoard,
    players: game.players,
    timers: game.timers,
  });
  await saveGameToRedis(gameId, game);
};

/**
 * Adds a new player to the game.
 */
const addNewPlayerToGame = async (socket, gameId, username, game, io) => {
  socket.join(gameId);
  game.players.push({ id: socket.id, username });

  if (game.players.length === 2) {
    assignPlayerSymbols(game);
    startTimer(io, game, gameId, redisClient);
  }

  await saveGameToRedis(gameId, game);
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
 * Assigns symbols to players randomly.
 */
const assignPlayerSymbols = (game) => {
  const playerSymbol = Math.random() < 0.5 ? "X" : "O";
  game.players[0].symbol = playerSymbol;
  game.players[1].symbol = playerSymbol === "X" ? "O" : "X";
};

/**
 * Validates if the move is allowed.
 */
const isValidMove = (game, subBoardIndex, squareIndex, player) => {
  return (
    game.board[subBoardIndex].subWinner === "" &&
    (game.currentSubBoard === null || subBoardIndex === game.currentSubBoard) &&
    game.board[subBoardIndex].squares[squareIndex] === "" &&
    game.turn === player
  );
};
