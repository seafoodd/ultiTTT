import React from "react";
import Cross from "./Cross";
import Circle from "./Circle";
import Tie from "./Tie";

interface BoardPreviewProps {
  board: {
    subWinner: string;
    squares: string[];
  }[];
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

const SubBoardPreview: React.FC<{ subWinner: string; className: string; squares: string[] }> = ({ subWinner, className, squares }) => (
  <div className={`grid grid-cols-3 relative aspect-square w-full h-full border-gray-400`}>
    <div className={`${className} absolute border-gray-400 w-full h-full z-10`}></div>
    {subWinner && (
      <div className={`absolute w-full h-full p-2 ${getBackgroundColorClass(subWinner)}`}>
        {renderSubWinner[subWinner]}
      </div>
    )}
    {squares.map((square, i) => (
      <SquarePreview
        key={i}
        className={`${[1, 4, 7].includes(i) ? "border-x" : ""} ${[3, 4, 5].includes(i) ? "border-y" : ""}`}
        value={square}
      />
    ))}
  </div>
);

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross />,
  O: <Circle />,
  "": "",
};

const SquarePreview: React.FC<{ value: string; className: string }> = ({ value, className }) => (
  <button className={`relative aspect-square w-full h-full flex items-center justify-center -z-10`}>
    <div className={`${className} absolute border-gray-500 w-full h-full`}></div>
    <div className="w-full h-full p-0.5">{renderIcon[value]}</div>
  </button>
);

const BoardPreview: React.FC<BoardPreviewProps> = ({ board }) => (
  <div className="relative grid grid-cols-3 gap-0 w-[216px] aspect-square rounded-md overflow-hidden">
    {board.map((subBoard, i) => (
      <SubBoardPreview
        key={i}
        subWinner={subBoard.subWinner}
        className={`${[1, 4, 7].includes(i) ? "border-x-2" : ""} ${[3, 4, 5].includes(i) ? "border-y-2" : ""}`}
        squares={subBoard.squares}
      />
    ))}
  </div>
);

export default BoardPreview;