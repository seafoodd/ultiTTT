import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { initializeSocket } from "./socket.js";
import authRoutes from "./routes/authRoutes.js";

configDotenv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", authRoutes);
// app.use("/game", gameRoutes);

initializeSocket(io);

server.listen(5000, () => {
  console.log("The server is running on port 5000");
});
