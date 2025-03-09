import {
  addNewPlayerToGame,
  assignPlayerSymbols,
  createNewGame,
  generateGameId,
} from "../utils/roomUtils.js";
import { saveGameToRedis } from "../utils/redisUtils.js";
import { emitGameState, emitToUser } from "../utils/socketUtils.js";
import { io, redisClient } from "../index.js";
import { startTimer } from "./gameController.js";
import {
  addPlayerToQueue,
  findMatch,
  findUnratedMatch,
  Player,
  removePlayerFromAllQueues,
} from "../utils/matchmakingUtils.js";
import { getPublicUserInfo } from "../utils/dbUtils.js";

/**
 * Handle sending a challenge to another user.
 * @param {Object} socket - The socket object.
 * @param {string} gameType - The type of game.
 * @param {string} username - The username of the challenged user.
 */
export const handleSendChallenge = async (socket, gameType, username) => {
  try {
    console.log("SEND CHALLENGE");
    const gameId = await generateGameId(8);
    const game = createNewGame(gameType, false);
    game.invitedUsername = username;

    await addNewPlayerToGame(
      socket,
      gameId,
      socket.username,
      socket.identifier,
      game,
    );
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    await emitToUser(socket, socket.identifier, "challengeCreated", gameId);
    await emitToUser(socket, username, "receiveChallenge", {
      from: socket.username,
      gameId,
      gameType,
    });
  } catch (e) {
    console.error("sendChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle declining a challenge.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 * @param {string} fromUsername - The username of the user who sent the challenge.
 */
export const handleDeclineChallenge = async (socket, gameId, fromUsername) => {
  try {
    const game = JSON.parse(await redisClient.get(`game:${gameId}`));
    if (game.invitedUsername !== socket.username) {
      socket.emit("error", "Not Found");
      return;
    }
    if (game.players.length < 2) {
      await redisClient.del(`game:${gameId}`);
      socket.gameRequests.delete(gameId);
    }

    await emitToUser(
      socket,
      fromUsername,
      "challengeDeclined",
      socket.identifier,
    );
  } catch (e) {
    console.error("declineChallenge error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle joining a game.
 * @param {Object} socket - The socket object.
 * @param {string} gameId - The ID of the game.
 */
export const handleJoinGame = async (socket, gameId) => {
  try {
    // console.log(`${socket.username} trying to connect to ${gameId}`);
    let game = JSON.parse(await redisClient.get(`game:${gameId}`));

    if (!game) {
      socket.emit("error", "No Game found");
      return;
    }

    const existingPlayer = game.players.find(
      (player) => player.identifier === socket.identifier,
    );

    if (existingPlayer) {
      socket.join(gameId);
      emitGameState(gameId, game);
      await saveGameToRedis(gameId, game);
      // console.log(`connected ${username}(${socket.id}) to ${gameId}`);
      return;
    }

    let canJoin = true;
    if (game.invitedUsername && game.invitedUsername !== socket.identifier) {
      canJoin = false;
    }

    if (game.players.length < 2 && canJoin) {
      await addNewPlayerToGame(
        socket,
        gameId,
        socket.username,
        socket.identifier,
        game,
      );
      assignPlayerSymbols(game);
      await startTimer(io, gameId, redisClient);
      await saveGameToRedis(gameId, game);
      emitGameState(gameId, game);
      socket.gameRequests.delete(gameId);
    }
  } catch (e) {
    console.error("joinGame error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle canceling a search for a match.
 * @param {Object} socket - The socket object.
 */
export const handleCancelSearch = async (socket) => {
  try {
    // await removePlayerFromQueue(user.username, gameType);
    await removePlayerFromAllQueues(socket.identifier);
    socket.emit("searchCancelled");
  } catch (e) {
    console.error("cancelSearch error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle searching for a match.
 * @param {Object} socket - The socket object.
 * @param {string} gameType - The type of game.
 * @param {boolean} isRanked
 */
export const handleSearchMatch = async (socket, gameType, isRanked) => {
  try {
    if (isRanked && socket.role === "guest") {
      socket.emit("error", "Unauthorized");
      return;
    }

    const user = await getPublicUserInfo(socket.username, { perfs: true });

    const player = new Player(
      socket.username,
      socket.identifier,
      isRanked ? user.perfs[gameType].elo : null,
    );
    await addPlayerToQueue(player, gameType, isRanked);
    socket.emit("searchStarted");

    const match = isRanked
      ? await findMatch(player, gameType)
      : await findUnratedMatch(gameType);

    if (match) {
      const [player1, player2] = match;
      const gameId = await generateGameId();
      const game = createNewGame(gameType, isRanked);
      console.log("created new game:", socket.username);

      for (const { username, identifier } of [player1, player2]) {
        await addNewPlayerToGame(socket, gameId, username, identifier, game);
      }

      assignPlayerSymbols(game);
      await startTimer(io, gameId, redisClient);
      await saveGameToRedis(gameId, game);

      for (const identifier of [player1.identifier, player2.identifier]) {
        await emitToUser(socket, identifier, "matchFound", gameId);
      }

      emitGameState(gameId, game);
    }
  } catch (e) {
    console.error("searchMatch error:", e);
    socket.emit("error", e.message);
  }
};

/**
 * Handle creating a friendly game.
 * @param {Object} socket - The socket object.
 * @param {string} gameType - The type of game.
 */
export const handleCreateFriendlyGame = async (socket, gameType) => {
  try {
    const gameId = await generateGameId(8);
    const game = createNewGame(gameType, false);
    await addNewPlayerToGame(
      socket,
      gameId,
      socket.username,
      socket.identifier,
      game,
    );
    await saveGameToRedis(gameId, game);
    socket.gameRequests.add(gameId);

    await emitToUser(socket, socket.identifier, "friendlyGameCreated", gameId);
  } catch (e) {
    console.error("createFriendlyGame error:", e);
    socket.emit("error", e.message);
  }
};
