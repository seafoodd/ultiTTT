import React from "react";
import SubBoardRework from "./SubBoardRework";

interface BoardReworkProps {
  board: { subWinner: string; squares: string[] }[];
  turn: string;
  player: string;
  victoryMessage: string;
  chooseSquare: (subBoardIndex: number, squareIndex: number) => void;
  currentSubBoard: number | null;
  currentMoveSelected: boolean;
  lastMove: { subBoardIndex: number; squareIndex: number };
}

const BoardRework: React.FC<BoardReworkProps> = ({
  chooseSquare,
  board,
  currentSubBoard,
  turn,
  currentMoveSelected,
  lastMove,
  victoryMessage,
  player,
}) => {
  const renderVictoryMessage = () => (
    <div
      className="flex items-center justify-center
      absolute inset-0 top-0 left-0 z-50 text-6xl
      font-bold bg-white/20 backdrop-blur-sm"
    >
      {victoryMessage}
    </div>
  );

  const renderSubBoards = () =>
    board.map((subBoard, i) => (
      <SubBoardRework
        key={i}
        player={player}
        subWinner={subBoard.subWinner}
        className={`${[1, 4, 7].includes(i) ? "border-x-2" : ""} ${[3, 4, 5].includes(i) ? "border-y-2" : ""}`}
        squares={subBoard.squares}
        turn={turn}
        lastMove={lastMove}
        subBoardIndex={i}
        highlightCurrent={
          currentMoveSelected &&
          (i === currentSubBoard || currentSubBoard === null)
        }
        onClick={(squareIndex: number) => chooseSquare(i, squareIndex)}
      />
    ));

  return (
    <div className="relative grid grid-cols-3 gap-0 w-full sm:w-[640px] aspect-square md:rounded-lg">
      {victoryMessage && currentMoveSelected && renderVictoryMessage()}
      {renderSubBoards()}
    </div>
  );
};

export default BoardRework;
