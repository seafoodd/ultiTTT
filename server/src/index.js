import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
// import { StreamChat } from "stream-chat";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import http from "http";

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

// const api_key = process.env.STREAM_API;
// const api_secret = process.env.STREAM_SECRET;

// const serverClient = StreamChat.getInstance(api_key, api_secret);

const users = {}; // In-memory user storage
const games = {}; // In-memory game storage

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    // const token = serverClient.createToken(userId);

    users[username] = { userId, username, hashedPassword };
    const token = uuidv4(); // Simple token generation for demo purposes

    res.status(201).json({ token, userId, username, hashedPassword });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // const { users } = await serverClient.queryUsers({ name: username });
    // if (users.length === 0)
    //   return res.status(404).json({ message: "User not found." });

    // const user = users[0];

    // const token = serverClient.createToken(user.id);

    const user = users[username];
    if (!user) return res.status(404).json({ message: "User not found." });

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (passwordMatch) {
      const token = uuidv4();
      return res.status(201).json({ token, username, userId: user.userId });
    }

    res.status(401).json({ error: "Wrong credentials." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinGame", (gameId) => {
    if (!games[gameId]) {
      games[gameId] = { board: Array(9).fill(""), players: [], turn: "X" };
    }

    if (games[gameId].players.some((player) => player.id === socket.id)) {
      console.log("You're already in game");
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
        console.log(games[gameId]);
      }
    }
  });

  socket.on("makeMove", ({ gameId, square, player }) => {
    if (games[gameId]) {
      games[gameId].board[square] = player;
      games[gameId].turn = player === "X" ? "O" : "X";
      io.to(gameId).emit("gameState", games[gameId]);
    }
  });

  socket.on("sendMessage", ({ gameId, message }) => {
    io.to(gameId).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(5000, () => {
  console.log("The server is running on port 5000");
});
