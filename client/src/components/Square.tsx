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
}

const renderIcon: { [key: string]: JSX.Element | string } = {
  X: <Cross size={32} />,
  O: <Circle size={32} />,
  "": "",
};

const Square: React.FC<SquareProps> = ({
  chooseSquare,
  val,
  isYourTurn,
  className,
  highlight,
  turn
}) => {
  console.log(highlight && val === "" && (turn === "X" ? "bg-color-1/40" : "bg-color-2/40"))
  return (
    <div
      className={`${className} flex-[33%]
     flex items-center justify-center text-[24px] font-semibold 
     ${(highlight && val === "") ? (turn === "X" ? "bg-color-1/30" : "bg-color-2/30") : 'bg-gray-700'}
     ${isYourTurn && highlight && "transition-bg duration-[100ms] cursor-pointer hover:bg-blue-200"}
     ${val === "X" ? "text-color-1" : "text-color-2"}`}
      onClick={chooseSquare}
    >
      <div>{renderIcon[val]}</div>
    </div>
  );
};

export default Square;
