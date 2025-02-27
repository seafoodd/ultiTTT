import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { initializeSocket } from "./socket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Redis from "ioredis";
import searchRoutes from "./routes/searchRoutes.js";
import {rateLimitMiddleware} from "./utils/rateLimitingUtils.js";
import friendRoutes from "./routes/friendRoutes.js";
import {restartTimers} from "./utils/redisUtils.js";
import bodyParser from "body-parser";
import paypalRoutes from "./routes/paypalRoutes.js";

configDotenv();

const app = express();
const server = http.createServer(app);

export const env = process.env.ENV || "production";

export const redisClient = new Redis({
  host: env === "production" ? "redis" : undefined,
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
app.use(bodyParser.json());
app.use(rateLimitMiddleware);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/search", searchRoutes)
app.use("/friends", friendRoutes);
app.use("/paypal-webhook", paypalRoutes);

initializeSocket();
await restartTimers();

server.listen(5000, () => {
  console.log("The server is running on port 5000");
});
