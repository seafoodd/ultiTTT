import { env } from "../index.js";

const debugWrapper = (fn) => {
  return (...args) => {
    if (env !== "development") return;
    fn(...args);
  };
};

export const debugLog = debugWrapper((message) => {
  console.log(message);
});

export const debugError = debugWrapper((message) => {
  console.error(message);
});

export const debugEmitError = debugWrapper(
  (socket, eventName, code, message) => {
    socket.emit(eventName, { code, message });
  },
);
