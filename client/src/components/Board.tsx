import React from "react";
import SubBoard from "./SubBoard";

interface BoardProps {
  board: { subWinner: string; squares: string[] }[];
  turn: string;
  player: string;
  victoryMessage: string;
  chooseSquare: (subBoardIndex: number, squareIndex: number) => void;
  currentSubBoard: number | null;
}

const Board: React.FC<BoardProps> = ({
  board,
  turn,
  player,
  victoryMessage,
  chooseSquare,
  currentSubBoard,
}) => {
  return (
    <div className="relative flex flex-col w-[640px] h-[640px]">
      {victoryMessage && (
        <div
          className="absolute inset-0 flex justify-center
         items-center backdrop-blur-[3px] z-50"
        >
          <h1 className="text-black text-4xl font-semibold">
            {victoryMessage}
          </h1>
        </div>
      )}
      <div className="flex flex-[33%]">
        <SubBoard
          board={board[0].squares}
          subWinner={board[0].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(0, index)}
          isCurrentSubBoard={currentSubBoard === 0 || currentSubBoard === null}
        />
        <SubBoard
          board={board[1].squares}
          subWinner={board[1].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(1, index)}
          isCurrentSubBoard={currentSubBoard === 1 || currentSubBoard === null}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          board={board[2].squares}
          subWinner={board[2].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(2, index)}
          isCurrentSubBoard={currentSubBoard === 2 || currentSubBoard === null}
        />
      </div>
      <div className="flex flex-[33%] border-t-[3px] border-b-[3px] border-white/40">
        <SubBoard
          board={board[3].squares}
          subWinner={board[3].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(3, index)}
          isCurrentSubBoard={currentSubBoard === 3 || currentSubBoard === null}
        />
        <SubBoard
          board={board[4].squares}
          subWinner={board[4].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(4, index)}
          isCurrentSubBoard={currentSubBoard === 4 || currentSubBoard === null}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          board={board[5].squares}
          subWinner={board[5].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(5, index)}
          isCurrentSubBoard={currentSubBoard === 5 || currentSubBoard === null}
        />
      </div>
      <div className="flex flex-[33%]">
        <SubBoard
          board={board[6].squares}
          subWinner={board[6].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(6, index)}
          isCurrentSubBoard={currentSubBoard === 6 || currentSubBoard === null}
        />
        <SubBoard
          board={board[7].squares}
          subWinner={board[7].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(7, index)}
          isCurrentSubBoard={currentSubBoard === 7 || currentSubBoard === null}
          className="border-r-[3px] border-l-[3px] border-white/40"
        />
        <SubBoard
          board={board[8].squares}
          subWinner={board[8].subWinner}
          turn={turn}
          player={player}
          chooseSquare={(index) => chooseSquare(8, index)}
          isCurrentSubBoard={currentSubBoard === 8 || currentSubBoard === null}
        />
      </div>
    </div>
  );
};

export default Board;
