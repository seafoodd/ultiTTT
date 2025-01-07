import {env, redisClient} from "../index.js";

const debugWrapper = (fn) => {
  return (...args) => {
    if (env !== "development") return;
    fn(...args);
  };
};

export const debugLog = debugWrapper((...message) => {
  console.log(...message);
});

export const debugError = debugWrapper((...message) => {
  console.error(...message);
});

export const debugEmitError = debugWrapper(
  (socket, eventName, code, message) => {
    socket.emit(eventName, { code, message });
  },
);

export const debugQueue = async (gameType, text = null) => {
  const players = await redisClient.zrange(`matchmaking:${gameType}`, 0, -1);
  console.log(`${text} - ${gameType}min:`,players)
};