import {winningPatterns} from "../constants";

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