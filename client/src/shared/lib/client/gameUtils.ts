import { winningPatterns } from "../../constants/patterns";
import { Socket } from "socket.io-client";

export const checkSubWinner = (squares: string[]): string => {
  for (let pattern of winningPatterns) {
    const [a, b, c] = pattern;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return squares.every((square) => square) ? "tie" : "";
};

export const checkGameWinner = (board: { subWinner: string }[]): string => {
  for (let pattern of winningPatterns) {
    const [a, b, c] = pattern;
    if (
      board[a].subWinner &&
      board[a].subWinner === board[b].subWinner &&
      board[a].subWinner === board[c].subWinner
    ) {
      return board[a].subWinner;
    }
  }
  return "";
};

export const getBoardAtMove = (moveIndex: number, moveHistory: any[]) => {
  const newBoard = Array.from({ length: 9 }, () => ({
    subWinner: "",
    squares: Array(9).fill(""),
  }));

  console.log('get board at move', moveHistory, moveIndex)

  if (moveHistory) {
    moveHistory.slice(0, moveIndex).forEach((move) => {
      newBoard[move.subBoardIndex].squares[move.squareIndex] = move.player;
      newBoard[move.subBoardIndex].subWinner = checkSubWinner(
        newBoard[move.subBoardIndex].squares,
      );
    });
  }

  return newBoard;
};

export const handleResign = (socket: Socket | null, gameId: string) => {
  if (!socket) return;
  socket.emit("resign", gameId);
};
