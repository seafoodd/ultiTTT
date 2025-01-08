import {io, redisClient} from "../index.js";
import {removePlayerFromAllQueues} from "../utils/matchmakingUtils.js";

/**
 * Handle user connection by adding the user to the online users set and storing the socket ID.
 * @param {Object} socket - The socket object.
 * @param {Object} user - The user object.
 */
export const handleConnect = async (socket, user) => {
  try {
    socket.username = user?.username || "guest";
    socket.gameRequests = new Set();
    console.log(socket.username, "has connected with id", socket.id);
    if (!user) return;
    await redisClient.sadd(`user:${user.username}`, socket.id);
    io.emit("userOnline", user.username);
  } catch (e) {
    console.error("Connection error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle user disconnection by removing user:{username}
 * and removing the user from matchmaking queues
 * @param {Object} socket - The socket object.
 */
export const handleDisconnect = async (socket) => {
  if (!socket.username) return;

  try {
    const socketIds = await redisClient.smembers(`user:${socket.username}`);
    console.log(socketIds);

    const invalidSocketIds = socketIds.filter(
      (id) => !io.sockets.sockets.has(id),
    );
    for (const id of invalidSocketIds) {
      await redisClient.srem(`user:${socket.username}`, id);
    }

    if (!socketIds.includes(socket.id)) return;

    await redisClient.srem(`user:${socket.username}`, socket.id);

    console.log(
      socket.username,
      "has disconnected a socket with id",
      socket.id,
    );
    if (socketIds.length <= 1) {
      await redisClient.del(`user:${socket.username}`);
      io.emit("userOffline", socket.username);
      await removePlayerFromAllQueues(socket.username);
      console.log(socket.username, "has disconnected");
    }
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
export const handleIsUserOnline = async (username, callback) => {
  const isOnline = await redisClient.exists(`user:${username}`);
  callback(isOnline === 1);
};