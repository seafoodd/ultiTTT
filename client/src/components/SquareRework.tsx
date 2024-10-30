import React from "react";
import Cross from "./Cross";
import Circle from "./Circle";

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross />,
  O: <Circle />,
  "": "",
};

interface SquareProps {
  value: string;
  isYourTurn: boolean;
  className?: string;
  highlightCurrent: boolean;
  turn: string;
  lastMove?: boolean;
  onClick: () => void;
}

const SquareRework: React.FC<SquareProps> = ({
  onClick,
  value,
  className,
  highlightCurrent,
  turn,
  lastMove,
  isYourTurn,
}) => {
  const highlight = highlightCurrent && value === "";
  return (
    <button
      className={`relative aspect-square w-full h-full flex items-center justify-center 
     ${
       highlight && isYourTurn
         ? `cursor-pointer ${turn === "X" ? "hover:bg-color-1/60" : "hover:bg-color-2/60"} transition-colors duration-75`
         : "cursor-default"
     }`}
      onClick={highlight ? onClick : () => {}}
    >
      <div
        className={`${className} absolute border-gray-500 w-full h-full
    ${highlight && (turn === "X" ? "bg-blue-900/50" : "bg-red-900/50")}`}
      ></div>
      <div
        className={`absolute inset-0 top-0 left-0 flex z-20
     ${lastMove && value !== "" && "border-4"}
     ${value === "X" ? "border-color-1" : "border-color-2"}`}
      ></div>
      <div className="w-full h-full p-2.5">{renderIcon[value]}</div>
    </button>
  );
};

export default SquareRework;
