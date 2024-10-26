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
}

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross size={180} transparent />,
  O: <Circle size={180} transparent />,
  tie: <Tie size={180} />,
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
}) => {
  const highlight = isCurrentSubBoard && subWinner === "";
  return (
    <div className={`${className} relative flex flex-col flex-[33%]`}>
      {subWinner && (
        <div
          className={`absolute inset-0 flex justify-center
           items-center z-10 ${
             subWinner === "X"
               ? "bg-color-1/60"
               : subWinner === "O"
                 ? "bg-color-2/60"
                 : "bg-color-3/60"
           }`}
        >
          <div>{renderIcon[subWinner]}</div>
        </div>
      )}
      <div className="flex flex-[33%]">
        <Square
          chooseSquare={() => chooseSquare(0)}
          val={board[0]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(1)}
          val={board[1]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(2)}
          val={board[2]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
      </div>
      <div className="flex flex-[33%] border-t border-b border-gray-500">
        <Square
          chooseSquare={() => chooseSquare(3)}
          val={board[3]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(4)}
          val={board[4]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(5)}
          val={board[5]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
      </div>
      <div className="flex flex-[33%]">
        <Square
          chooseSquare={() => chooseSquare(6)}
          val={board[6]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(7)}
          val={board[7]}
          isYourTurn={turn === player}
          turn={turn}
          className="border-l border-r border-gray-500"
          highlight={highlight}
        />
        <Square
          chooseSquare={() => chooseSquare(8)}
          val={board[8]}
          isYourTurn={turn === player}
          turn={turn}
          highlight={highlight}
        />
      </div>
    </div>
  );
};

export default SubBoard;
