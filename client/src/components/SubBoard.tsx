import React from "react";
import Square from "./Square";
import Cross from "./Cross";
import Circle from "./Circle";
import Tie from "./Tie";

interface SubBoardProps {
  board: string[];
  turn: string;
  player: string;
  chooseSquare: (index: number) => void;
  className?: string;
  isCurrentSubBoard: boolean;
  subWinner: string;
  currentMoveSelected: boolean;
  lastMove: { subBoardIndex: number; squareIndex: number };
  subBoardIndex: number;
}

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross transparent />,
  O: <Circle transparent />,
  tie: <Tie />,
  "": "",
};

const SubBoard: React.FC<SubBoardProps> = ({
  board,
  turn,
  player,
  chooseSquare,
  className,
  isCurrentSubBoard,
  subWinner,
  currentMoveSelected,
  lastMove,
  subBoardIndex,
}) => {
  const highlight = isCurrentSubBoard && subWinner === "";
  return (
    <div className={`${className} relative flex flex-col flex-1/3`}>
      {subWinner && (
        <div
          className={`absolute inset-0 flex justify-center
           items-center z-10 w-full h-full ${
             subWinner === "X"
               ? "bg-color-1/60"
               : subWinner === "O"
                 ? "bg-color-2/60"
                 : "bg-color-3/60"
           }`}
        >
          <div className="w-full h-full p-2">{renderIcon[subWinner]}</div>
        </div>
      )}
      <div className="flex flex-[33%]">
        <Square
          chooseSquare={() => chooseSquare(0)}
          val={board[0]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 0
          }
        />
        <Square
          chooseSquare={() => chooseSquare(1)}
          val={board[1]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 1
          }
        />
        <Square
          chooseSquare={() => chooseSquare(2)}
          val={board[2]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 2
          }
        />
      </div>
      <div className="flex flex-1/3 border-t border-b border-gray-500">
        <Square
          chooseSquare={() => chooseSquare(3)}
          val={board[3]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 3
          }
        />
        <Square
          chooseSquare={() => chooseSquare(4)}
          val={board[4]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 4
          }
        />
        <Square
          chooseSquare={() => chooseSquare(5)}
          val={board[5]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 5
          }
        />
      </div>
      <div className="flex flex-1/3">
        <Square
          chooseSquare={() => chooseSquare(6)}
          val={board[6]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 6
          }
        />
        <Square
          chooseSquare={() => chooseSquare(7)}
          val={board[7]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 7
          }
        />
        <Square
          chooseSquare={() => chooseSquare(8)}
          val={board[8]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight && currentMoveSelected}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === 8
          }
        />
      </div>
    </div>
  );
};

export default SubBoard;
