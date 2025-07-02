import React from "react";
import SubBoard from "./SubBoard";
import Button from "../shared/ui/Button";
import { Link } from "react-router-dom";

interface BoardReworkProps {
  board: { subWinner: string; squares: string[] }[];
  turn: string;
  player: string;
  victoryMessage: string;
  setVictoryMessage: React.Dispatch<React.SetStateAction<string>>;
  chooseSquare: (subBoardIndex: number, squareIndex: number) => void;
  currentSubBoard: number | null;
  currentMoveSelected: boolean;
  gameFinished: boolean;
  lastMove: { subBoardIndex: number; squareIndex: number };
}

const Board: React.FC<BoardReworkProps> = ({
  chooseSquare,
  board,
  currentSubBoard,
  turn,
  currentMoveSelected,
  lastMove,
  victoryMessage,
  setVictoryMessage,
  player,
  gameFinished,
}) => {
  const renderVictoryMessage = () => (
    <div
      className="flex items-center justify-center
      absolute w-full h-full left-0 z-30
      bg-white/5"
      onClick={() => setVictoryMessage("")}
    >
      <div
        className="w-72 h-36 rounded-lg bg-color-neutral-900
       flex flex-col justify-center items-center text-xl font-bold"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {victoryMessage}
        <Link to="/">
          <Button className="bg-color-accent-400 text-white px-3 py-2 mt-4">
            Home
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderSubBoards = () =>
    board.map((subBoard, i) => (
      <SubBoard
        key={i}
        player={player}
        subWinner={subBoard.subWinner}
        className={`${[1, 4, 7].includes(i) ? "border-x-2" : ""} ${
          [3, 4, 5].includes(i) ? "border-y-2" : ""
        }`}
        squares={subBoard.squares}
        turn={turn}
        lastMove={lastMove}
        subBoardIndex={i}
        highlightCurrent={
          !gameFinished &&
          currentMoveSelected &&
          (i === currentSubBoard || currentSubBoard === null)
        }
        onClick={(squareIndex: number) => chooseSquare(i, squareIndex)}
      />
    ));

  return (
    <div className="relative grid grid-cols-3 gap-0 w-full max-w-[640px] md:w-[640px] aspect-square md:rounded-lg overflow-hidden">
      {victoryMessage && currentMoveSelected && renderVictoryMessage()}
      {renderSubBoards()}
    </div>
  );
};

export default Board;
