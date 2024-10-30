import React from "react";
import SubBoard from "./SubBoard";

interface BoardProps {
  board: { subWinner: string; squares: string[] }[];
  turn: string;
  player: string;
  victoryMessage: string;
  chooseSquare: (subBoardIndex: number, squareIndex: number) => void;
  currentSubBoard: number | null;
  currentMoveSelected: boolean;
  lastMove: {subBoardIndex: number, squareIndex: number};
}

const Board: React.FC<BoardProps> = ({
  board,
  turn,
  player,
  victoryMessage,
  chooseSquare,
  currentSubBoard,
  currentMoveSelected,
  lastMove
}) => {
  return (
    <div className="relative flex flex-col
     w-full h-full
     overflow-hidden md:rounded-lg">
      {victoryMessage && (
        <div
          className="absolute inset-0 flex justify-center
         items-center backdrop-blur-sm z-50"
        >
          <h1 className="text-6xl font-semibold">
            {victoryMessage}
          </h1>
        </div>
      )}
      <div className="flex flex-1/3">
        <SubBoard
          subBoardIndex={0}
          board={board[0].squares}
          subWinner={board[0].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(0, index)}
          isCurrentSubBoard={currentSubBoard === 0 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
        <SubBoard
          subBoardIndex={1}
          board={board[1].squares}
          subWinner={board[1].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(1, index)}
          isCurrentSubBoard={currentSubBoard === 1 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          subBoardIndex={2}
          board={board[2].squares}
          subWinner={board[2].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(2, index)}
          isCurrentSubBoard={currentSubBoard === 2 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
      </div>
      <div className="flex flex-1/3 border-t-[3px] border-b-[3px] border-white/40">
        <SubBoard
          subBoardIndex={3}
          board={board[3].squares}
          subWinner={board[3].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(3, index)}
          isCurrentSubBoard={currentSubBoard === 3 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
        <SubBoard
          subBoardIndex={4}
          board={board[4].squares}
          subWinner={board[4].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(4, index)}
          isCurrentSubBoard={currentSubBoard === 4 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          subBoardIndex={5}
          board={board[5].squares}
          subWinner={board[5].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(5, index)}
          isCurrentSubBoard={currentSubBoard === 5 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
      </div>
      <div className="flex flex-1/3">
        <SubBoard
          subBoardIndex={6}
          board={board[6].squares}
          subWinner={board[6].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(6, index)}
          isCurrentSubBoard={currentSubBoard === 6 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
        <SubBoard
          subBoardIndex={7}
          board={board[7].squares}
          subWinner={board[7].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(7, index)}
          isCurrentSubBoard={currentSubBoard === 7 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          subBoardIndex={8}
          board={board[8].squares}
          subWinner={board[8].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(8, index)}
          isCurrentSubBoard={currentSubBoard === 8 || currentSubBoard === null}
          currentMoveSelected={currentMoveSelected}
          lastMove={lastMove}
        />
      </div>
    </div>
  );
};

export default Board;
