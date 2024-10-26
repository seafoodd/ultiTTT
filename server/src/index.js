import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
configDotenv();

app.use(cors({ origin: "*" }));
app.use(express.json());

const users = {};
const games = {};

const authenticateToken = (req, res, next) => {
  console.log(users);
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (!users[user.username]) return res.sendStatus(404);
    req.user = user;
    next();
  });
};

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    users[username] = { userId, username, hashedPassword };
    const token = jwt.sign(
      { username, userId },
      process.env.ACCESS_TOKEN_SECRET,
    );

    res.status(201).json({ token, userId, username, hashedPassword });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const user = users[username];
    if (!user) return res.status(404).json({ message: "User not found." });

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
    if (passwordMatch) {
      const tokenOptions = rememberMe ? {} : { expiresIn: "1h" };
      const token = jwt.sign(
        { username, userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET,
        tokenOptions,
      );
      return res.status(201).json({ token, username, userId: user.userId });
    }

    res.status(401).json({ error: "Wrong credentials." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get("/verifyToken", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinGame", (gameId) => {
    console.log("joined game with Id ", gameId);
    if (!games[gameId]) {
      games[gameId] = {
        board: Array.from({ length: 9 }, () => ({
          subWinner: "",
          squares: Array(9).fill(""),
        })),
        players: [],
        turn: "X",
        currentSubBoard: null,
      };
      console.log("created game: ", games[gameId]);
    }

    if (games[gameId].players.some((player) => player.id === socket.id)) {
      io.to(gameId).emit("gameState", games[gameId]);
      return;
    }

    if (games[gameId].players.length < 2) {
      socket.join(gameId);
      games[gameId].players.push({ id: socket.id });

      if (games[gameId].players.length === 2) {
        const playerSymbol = Math.random() < 0.5 ? "X" : "O";
        games[gameId].players[0].symbol = playerSymbol;
        games[gameId].players[1].symbol = playerSymbol === "X" ? "O" : "X";
        io.to(gameId).emit("gameState", games[gameId]);
      }
    }
  });

  socket.on("makeMove", ({ gameId, subBoardIndex, squareIndex, player }) => {
    const game = games[gameId];
    if (
      game &&
      game.board[subBoardIndex].subWinner === "" &&
      (game.currentSubBoard === null || subBoardIndex === game.currentSubBoard) &&
      game.board[subBoardIndex].squares[squareIndex] === "" &&
      game.turn === player
    ) {
      handleMove(game, subBoardIndex, squareIndex, player);
      handleOverallWin(game, gameId);
      updateCurrentSubBoard(game, squareIndex);

      console.log(JSON.stringify(game, null, 2));
      io.to(gameId).emit("gameState", game);
    }
  });

  socket.on("sendMessage", ({ gameId, message }) => {
    io.to(gameId).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const handleMove = (game, subBoardIndex, squareIndex, player) => {
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";

  if (checkWin(game.board[subBoardIndex].squares)) {
    console.log(`subBoard ${subBoardIndex} won by ${player}`);
    game.board[subBoardIndex].subWinner = player;
  } else if (checkTie(game.board[subBoardIndex].squares)) {
    console.log(`subBoard ${subBoardIndex} tied`);
    game.board[subBoardIndex].subWinner = "tie";
  }
};

const handleOverallWin = (game, gameId) => {
  const overallWinner = checkOverallWin(game.board);
  if (overallWinner) {
    io.to(gameId).emit("gameResult", {
      winner: overallWinner,
      state: "Won",
    });
  } else if (game.board.every((subBoard) => subBoard.subWinner !== "")) {
    io.to(gameId).emit("gameResult", { winner: "none", state: "Tie" });
  }
};

const updateCurrentSubBoard = (game, squareIndex) => {
  game.currentSubBoard = squareIndex;
  if (game.board[squareIndex].subWinner !== "") game.currentSubBoard = null;
};

const Patterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWin = (board) => {
  for (let i = 0; i < Patterns.length; i++) {
    const [a, b, c] = Patterns[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
};

const checkTie = (board) => {
  return board.every((square) => square !== "");
};

const checkOverallWin = (board) => {
  for (let i = 0; i < Patterns.length; i++) {
    const [a, b, c] = Patterns[i];
    if (
      board[a].subWinner &&
      board[a].subWinner === board[b].subWinner &&
      board[a].subWinner === board[c].subWinner
    ) {
      return board[a].subWinner;
    }
  }
  return null;
};

server.listen(5000, () => {
  console.log("The server is running on port 5000");
});
