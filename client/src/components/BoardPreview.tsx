import React from "react";
import Cross from "../shared/icons/Cross";
import Circle from "../shared/icons/Circle";
import Tie from "../shared/icons/Tie";

interface BoardPreviewProps {
  board: {
    subWinner: string;
    squares: string[];
  }[];
  size?: number;
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

const SubBoardPreview: React.FC<{
  subWinner: string;
  className: string;
  squares: string[];
}> = ({ subWinner, className, squares }) => (
  <div
    className={`grid grid-cols-3 relative aspect-square w-full h-full border-color-neutral-200`}
  >
    <div
      className={`${className} absolute border-color-neutral-200 w-full h-full z-20`}
    ></div>
    {subWinner && (
      <div
        className={`absolute w-full h-full p-2 z-10 ${getBackgroundColorClass(
          subWinner
        )}`}
      >
        {renderSubWinner[subWinner]}
      </div>
    )}
    {squares.map((square, i) => (
      <SquarePreview
        key={i}
        className={`${[1, 4, 7].includes(i) ? "border-x" : ""} ${
          [3, 4, 5].includes(i) ? "border-y" : ""
        }`}
        value={square}
      />
    ))}
  </div>
);

const renderIcon: { [key: string]: React.ReactNode | string } = {
  X: <Cross />,
  O: <Circle />,
  "": "",
};

const SquarePreview: React.FC<{ value: string; className: string }> = ({
  value,
  className,
}) => (
  <button
    className={`relative aspect-square w-full h-full flex items-center justify-center`}
  >
    <div
      className={`${className} absolute border-color-neutral-300 w-full h-full`}
    ></div>
    <div className="w-full h-full p-0.5">{renderIcon[value]}</div>
  </button>
);

const BoardPreview: React.FC<BoardPreviewProps> = ({ board, size = 216 }) => (
  <div
    className={`relative grid grid-cols-3 gap-0 rounded-md overflow-hidden border border-color-neutral-200`}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    {board.map((subBoard, i) => (
      <SubBoardPreview
        key={i}
        subWinner={subBoard.subWinner}
        className={`${[1, 4, 7].includes(i) ? "border-x-2" : ""} ${
          [3, 4, 5].includes(i) ? "border-y-2" : ""
        }`}
        squares={subBoard.squares}
      />
    ))}
  </div>
);

export default BoardPreview;
