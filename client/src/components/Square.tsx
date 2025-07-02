import React from "react";
import Cross from "../shared/icons/Cross";
import Circle from "../shared/icons/Circle";

const renderIcon: { [key: string]: React.ReactNode | string } = {
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

const Square: React.FC<SquareProps> = ({
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
         ? `cursor-pointer ${
             turn === "X"
               ? "hover:bg-color-symbols-x/60"
               : "hover:bg-color-symbols-o/60"
           }
           transition-colors duration-75`
         : "cursor-default"
     }`}
      onClick={highlight ? onClick : () => {}}
    >
      <div
        className={`${className} absolute border-color-accent-100/50 w-full h-full
    ${
      highlight &&
      (turn === "X" ? "bg-color-information-600/25" : "bg-color-danger-600/25")
    }`}
      ></div>
      <div
        className={`absolute inset-0 justify-center items-center flex
     ${lastMove && value !== "" && "border-4"}
     ${value === "X" ? "border-color-symbols-x" : "border-color-symbols-o"}`}
      ></div>
      <div className="w-full h-full p-1.5 sm:p-2 md:p-2.5">
        {renderIcon[value]}
      </div>
    </button>
  );
};

export default Square;
