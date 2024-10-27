import React from "react";
import Cross from "./Cross";
import Circle from "./Circle";

interface SquareProps {
  chooseSquare: () => void;
  val: string;
  isYourTurn: boolean;
  className?: string;
  highlight: boolean;
  turn: string;
  lastMove?: boolean;
}

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross />,
  O: <Circle />,
  "": "",
};

const getBackgroundClass = (highlight: boolean, val: string, turn: string) => {
  if (highlight && val === "") {
    return turn === "X" ? "bg-color-1/50" : "bg-color-2/50";
  }
  return "bg-gray-700";
};

const getHoverClass = (
  isYourTurn: boolean,
  highlight: boolean,
  val: string,
  turn: string,
) => {
  if (isYourTurn && highlight && val === "") {
    return `transition-bg duration-[100ms] cursor-pointer ${
      turn === "X" ? "hover:bg-blue-600/60" : "hover:bg-red-600/60"
    }`;
  }
  return "";
};

const Square: React.FC<SquareProps> = ({
  chooseSquare,
  val,
  isYourTurn,
  className,
  highlight,
  turn,
  lastMove,
}) => {
  return (
    <div
      className={`${className} flex-1/3 flex items-center
       justify-center text-[24px] font-semibold 
       ${getBackgroundClass(highlight, val, turn)} 
       ${getHoverClass(isYourTurn, highlight, val, turn)} ${
         val === "X" ? "text-color-1" : "text-color-2"
       }`}
      onClick={() => {
        if (highlight && isYourTurn) chooseSquare();
      }}
    >
      <div
        className={`w-full  h-full
         flex items-center justify-center relative`}
      >
        <div
          className={`inset-0 top-0
          ${lastMove && val !== "" && "border-2 sm:border-4"}
          ${val === "X" ? "border-color-1" : "border-color-2"}
          left-0 absolute w-full`}
        ></div>
        <div className='w-full h-full flex p-2.5'>

        {renderIcon[val]}
        </div>
      </div>
    </div>
  );
};

export default Square;
