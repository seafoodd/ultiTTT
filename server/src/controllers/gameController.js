import { checkWin, checkTie, checkOverallWin } from "../utils/gameUtils.js";
import prisma from "../../prisma/prismaClient.js";
import games from "../models/gameModel.js";

export const handleMove = (game, subBoardIndex, squareIndex, player) => {
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";

  game.moveHistory.push({ subBoardIndex, squareIndex, player });
  // console.log(game.moveHistory)
  // console.log(game.board);

  if (checkWin(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = player;
  } else if (checkTie(game.board[subBoardIndex].squares)) {
    game.board[subBoardIndex].subWinner = "tie";
  }
};

export const handleOverallWin = async (io, game, gameId) => {
  const overallWinner = checkOverallWin(game.board);
  const gameResult = {
    board: game.board,
    winner: overallWinner || "none",
    moveHistory: game.moveHistory,
  };

  if (
    overallWinner ||
    game.board.every((subBoard) => subBoard.subWinner !== "")
  ) {
    io.to(gameId).emit("gameResult", gameResult);

    try {
      const player1 = await prisma.user.findUnique({
        where: { username: game.players[0].username },
      });
      const player2 = await prisma.user.findUnique({
        where: { username: game.players[1].username },
      });

      if (player1 && player2) {
        const player1Outcome = overallWinner === game.players[0].symbol ? 1 : (overallWinner ? 0 : 0.5);
        const player2Outcome = overallWinner === game.players[1].symbol ? 1 : (overallWinner ? 0 : 0.5);

        const player1EloChange = calculateEloChange(
          player1.elo,
          player1.rd,
          player1.vol,
          player2.elo,
          player2.rd,
          player1Outcome
        );
        const player2EloChange = calculateEloChange(
          player2.elo,
          player2.rd,
          player2.vol,
          player1.elo,
          player1.rd,
          player2Outcome
        );

        let winnerId = null;
        let winnerUsername = null;

        if (overallWinner) {
          winnerId =
            overallWinner === game.players[0].symbol ? player1.id : player2.id;
          winnerUsername =
            overallWinner === game.players[0].symbol
              ? player1.username
              : player2.username;
        }

        await prisma.game.create({
          data: {
            board: game.board,
            winner: winnerUsername,
            winnerId: winnerId,
            moveHistory: game.moveHistory,
            player1: { connect: { id: player1.id } },
            player1Elo: player1.elo,
            player1EloChange: player1EloChange.newRating - player1.elo,
            player2: { connect: { id: player2.id } },
            player2Elo: player2.elo,
            player2EloChange: player2EloChange.newRating - player2.elo,
          },
        });

        await prisma.user.update({
          where: { id: player1.id },
          data: {
            elo: player1EloChange.newRating,
            rd: player1EloChange.newRd,
            vol: player1EloChange.newVol
          },
        });

        await prisma.user.update({
          where: { id: player2.id },
          data: {
            elo: player2EloChange.newRating,
            rd: player2EloChange.newRd,
            vol: player2EloChange.newVol
          },
        });
      }
    } catch (error) {
      console.error("Error saving game result:", error);
    }

    finishGame(io, game, gameId);
  }
};

const calculateEloChange = (playerElo, playerRd, playerVol, opponentElo, opponentRd, outcome) => {
  const q = Math.log(10) / 400;
  const g = (rd) => 1 / Math.sqrt(1 + (3 * q * q * rd * rd) / (Math.PI * Math.PI));
  const E = (rating, opponentRating, rd) => 1 / (1 + Math.pow(10, -g(rd) * (rating - opponentRating) / 400));

  const d2 = 1 / (q * q * g(opponentRd) * g(opponentRd) * E(playerElo, opponentElo, opponentRd) * (1 - E(playerElo, opponentElo, opponentRd)));
  const newVol = Math.sqrt(playerVol * playerVol + d2);

  const newRd = 1 / Math.sqrt(1 / (playerRd * playerRd) + 1 / d2);
  const newRating = playerElo + q / (1 / (playerRd * playerRd) + 1 / d2) * g(opponentRd) * (outcome - E(playerElo, opponentElo, opponentRd));

  return { newRating, newRd, newVol };
};

const finishGame = (io, game, gameId) => {
  io.to(gameId).disconnectSockets(true);
  clearInterval(game.timerInterval);
  delete games[gameId];
};

export const updateCurrentSubBoard = (game, squareIndex) => {
  game.currentSubBoard = squareIndex;
  if (game.board[squareIndex].subWinner !== "") game.currentSubBoard = null;
};

export const startTimer = (io, game, gameId) => {
  game.timerInterval = setInterval(() => {
    if (game.timers[game.turn] > 0) {
      game.timers[game.turn]--;
      io.to(gameId).emit("timerUpdate", game.timers);
    } else {
      io.to(gameId).emit("gameResult", {
        winner: game.turn === "X" ? "O" : "X",
        state: "Won",
      });
      finishGame(io, game, gameId);
    }
  }, 1000);
};
