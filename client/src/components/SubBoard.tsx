import React from "react";
import Square from "./Square";
import Cross from "../shared/icons/Cross";
import Circle from "../shared/icons/Circle";
import Tie from "../shared/icons/Tie";

interface SubBoardProps {
  turn: string;
  player: string;
  onClick: (index: number) => void;
  className?: string;
  subWinner: string;
  lastMove: { subBoardIndex: number; squareIndex: number };
  subBoardIndex: number;
  highlightCurrent: boolean;
  squares: string[];
}

const renderSubWinner: { [key: string]: React.ReactNode | string } = {
  X: <Cross transparent />,
  O: <Circle transparent />,
  tie: <Tie />,
  "": "",
};
const getBackgroundColorClass = (subWinner: string) => {
  switch (subWinner) {
    case "X":
      return "bg-color-symbols-x/60";
    case "O":
      return "bg-color-symbols-o/60";
    case "tie":
      return "bg-color-symbols-tie/60";
    default:
      return "";
  }
};
const SubBoard: React.FC<SubBoardProps> = ({
  squares,
  onClick,
  className,
  highlightCurrent,
  subWinner,
  turn,
  lastMove,
  subBoardIndex,
  player,
}) => {
  return (
    <div
      className={`grid grid-cols-3 relative aspect-square w-full h-full border-gray-400`}
    >
      <div
        className={`${className} absolute border-color-accent-100/90 w-full h-full z-20 pointer-events-none`}
      ></div>
      {subWinner && (
        <div
          className={`absolute w-full h-full p-2 z-10
      ${getBackgroundColorClass(subWinner)}`}
        >
          {renderSubWinner[subWinner]}
        </div>
      )}
      {squares.map((square: string, i: number) => (
        <Square
          isYourTurn={turn === player}
          key={i}
          highlightCurrent={highlightCurrent && subWinner === ""}
          className={`${[1, 4, 7].includes(i) && "border-x"} ${
            [3, 4, 5].includes(i) && "border-y"
          }`}
          value={square}
          turn={turn}
          lastMove={
            lastMove?.subBoardIndex === subBoardIndex &&
            lastMove?.squareIndex === i
          }
          onClick={() => onClick(i)}
        />
      ))}
    </div>
  );
};

export default SubBoard;
