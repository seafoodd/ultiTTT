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