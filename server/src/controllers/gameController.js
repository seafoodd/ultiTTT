import { checkWin, checkTie, checkOverallWin } from "../utils/gameUtils.js";
// import users from "../models/userModel.js";
import prisma from "../../prisma/prismaClient.js";
import games from "../models/gameModel.js";

export const handleMove = (game, subBoardIndex, squareIndex, player) => {
  game.board[subBoardIndex].squares[squareIndex] = player;
  game.turn = player === "X" ? "O" : "X";

  game.moveHistory.push({ subBoardIndex, squareIndex, player });
  // console.log(game.moveHistory)

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
    state: overallWinner ? "Won" : "Tie",
    moveHistory: game.moveHistory,
  };

  if (
    overallWinner ||
    game.board.every((subBoard) => subBoard.subWinner !== "")
  ) {
    io.to(gameId).emit("gameResult", gameResult);

    // for (const player of game.players) {
    //   const user = users[player.username];
    //   if (user) {
    //     if (!user.gameHistory) {
    //       user.gameHistory = [];
    //     }
    //     user.gameHistory.push(gameResult);
    //     console.log(user);
    //   } else {
    //     console.error(`Player with username ${player.username} not found in users object.`);
    //     console.log(gameResult)
    //   }
    // }

    try {
      const player1 = await prisma.user.findUnique({
        where: { username: game.players[0].username },
      });
      const player2 = await prisma.user.findUnique({
        where: { username: game.players[1].username },
      });

      if (player1 && player2) {
        const player1EloChange = calculateEloChange(
          player1.elo,
          player2.elo,
          overallWinner === game.players[0].symbol,
        );
        const player2EloChange = calculateEloChange(
          player2.elo,
          player1.elo,
          overallWinner === game.players[1].symbol,
        );

        await prisma.game.create({
          data: {
            board: game.board,
            winner: overallWinner || "none",
            moveHistory: game.moveHistory,
            player1: { connect: { id: player1.id } },
            player1Elo: player1.elo,
            player1EloChange: player1EloChange,
            player2: { connect: { id: player2.id } },
            player2Elo: player2.elo,
            player2EloChange: player2EloChange,
          },
        });

        await prisma.user.update({
          where: { id: player1.id },
          data: { elo: player1.elo + player1EloChange },
        });

        await prisma.user.update({
          where: { id: player2.id },
          data: { elo: player2.elo + player2EloChange },
        });
      }
    } catch (error) {
      console.error("Error saving game result:", error);
    }

    finishGame(io, game, gameId);
  }
};

const calculateEloChange = (playerElo, opponentElo, isWinner) => {
  // TODO: Implement an actual elo system
  return isWinner ? 10 : -10;
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
