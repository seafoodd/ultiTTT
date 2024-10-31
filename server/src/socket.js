import {
  handleMove,
  handleOverallWin,
  startTimer,
  updateCurrentSubBoard,
} from "./controllers/gameController.js";
import games from "./models/gameModel.js";
import {getUserByToken} from "./utils/authUtils.js";

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("joinGame", async (gameId, token) => {
      try {
        const user = await getUserByToken(token);
        const username = user.username
        console.log(username)

        console.log("joined game with Id ", gameId);
        if (!games[gameId]) {
          games[gameId] = {
            board: Array.from({ length: 9 }, () => ({
              subWinner: "",
              squares: Array(9).fill(""),
            })),
            players: [],
            moveHistory: [],
            turn: "X",
            currentSubBoard: null,
            timers: {
              X: 600,
              O: 600,
            },
          };
          // console.log("created game: ", games[gameId]);
        }
        const game = games[gameId];

        if (game.players.some((player) => player.username === username)) {
          // io.to(gameId).emit("gameState", game);
          console.log("player already in game");
          return;
        }

        if (game.players.length < 2) {
          socket.join(gameId);
          game.players.push({ id: socket.id, username });

          if (game.players.length === 2) {
            const playerSymbol = Math.random() < 0.5 ? "X" : "O";
            game.players[0].symbol = playerSymbol;
            game.players[1].symbol = playerSymbol === "X" ? "O" : "X";
            startTimer(io, game, gameId);
            io.to(gameId).emit("gameState", {
              board: game.board,
              turn: game.turn,
              moveHistory: game.moveHistory,
              currentSubBoard: game.currentSubBoard,
              players: game.players,
            });
          }
        }
      } catch (e) {
        console.error("Token verification failed:", e.message);
      }
    });

    socket.on("makeMove", ({ gameId, subBoardIndex, squareIndex, player }) => {
      const game = games[gameId];
      if (
        game &&
        game.board[subBoardIndex].subWinner === "" &&
        (game.currentSubBoard === null ||
          subBoardIndex === game.currentSubBoard) &&
        game.board[subBoardIndex].squares[squareIndex] === "" &&
        game.turn === player
      ) {
        handleMove(game, subBoardIndex, squareIndex, player);
        updateCurrentSubBoard(game, squareIndex);

        // console.log(
        //   "Emitting gameState:",
        //   JSON.stringify(
        //     {
        //       board: game.board,
        //       turn: game.turn,
        //       moveHistory: game.moveHistory,
        //       currentSubBoard: game.currentSubBoard,
        //       players: game.players,
        //     },
        //     null,
        //     2,
        //   ),
        // );

        io.to(gameId).emit("gameState", {
          board: game.board,
          turn: game.turn,
          moveHistory: game.moveHistory,
          currentSubBoard: game.currentSubBoard,
          players: game.players,
        });
        handleOverallWin(io, game, gameId);
      }
    });

    socket.on("sendMessage", ({ gameId, message }) => {
      io.to(gameId).emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
