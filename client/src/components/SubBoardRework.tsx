import React from "react";
import SquareRework from "./SquareRework";
import Cross from "./Cross";
import Circle from "./Circle";
import Tie from "./Tie";

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

const renderSubWinner: { [key: string]: JSX.Element | string } = {
  X: <Cross transparent />,
  O: <Circle transparent />,
  tie: <Tie />,
  "": "",
};
const getBackgroundColorClass = (subWinner: string) => {
  switch (subWinner) {
    case "X":
      return "bg-color-1/60";
    case "O":
      return "bg-color-2/60";
    case "tie":
      return "bg-color-3/60";
    default:
      return "";
  }
};
const SubBoardRework: React.FC<SubBoardProps> = ({
  squares,
  onClick,
  className,
  highlightCurrent,
  subWinner,
  turn,
  lastMove,
  subBoardIndex,
  player
}) => (
  <div
    className={`grid grid-cols-3 relative aspect-square w-full h-full border-gray-400`}
  >
    <div
      className={`${className} absolute border-gray-400 w-full h-full z-10 pointer-events-none`}
    ></div>
    {subWinner && (
      <div
        className={`absolute w-full h-full p-2 z-30
      ${getBackgroundColorClass(subWinner)}`}
      >
        {renderSubWinner[subWinner]}
      </div>
    )}
    {squares.map((square: string, i: number) => (
      <SquareRework
        isYourTurn={turn === player}
        key={i}
        highlightCurrent={highlightCurrent && subWinner === ""}
        className={`${(i === 1 || i === 4 || i === 7) && "border-x"} ${(i === 3 || i === 4 || i === 5) && "border-y"}`}
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

export default SubBoardRework;
