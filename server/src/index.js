import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { initializeSocket } from "./socket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Redis from "ioredis";

configDotenv();

const app = express();
const server = http.createServer(app);

export const redisClient = new Redis({
  host: "redis",
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
// await redisClient.connect();

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
// app.use("/game", gameRoutes);

initializeSocket();

server.listen(5000, () => {
  console.log("The server is running on port 5000");
});
