import React from "react";
import { FaFlag } from "react-icons/fa";
import {
  FaBackwardFast,
  FaBackwardStep,
  FaForwardFast,
  FaForwardStep,
} from "react-icons/fa6";
import Timer from "./Timer";
import Board from "./Board";
import { ImCross } from "react-icons/im";
import {useAuth} from "../context/AuthContext";
import {useSocket} from "../context/SocketContext";
import {handleResign} from "../utils/gameUtils";

interface GameViewProps {
  opponentUsername: string;
  symbol: string;
  timers: { X: number; O: number };
  board: { subWinner: string; squares: string[] }[];
  turn: string;
  moveHistory: { subBoardIndex: number; squareIndex: number; player: string }[];
  currentMoveIndex: number;
  chooseSquare: (subBoardIndex: number, squareIndex: number) => void;
  victoryMessage: string;
  setVictoryMessage: any;
  currentSubBoard: number | null;
  setCurrentMoveIndex: any;
  gameId: string;
}

export const GameView: React.FC<GameViewProps> = ({
  opponentUsername,
  symbol,
  timers,
  board,
  turn,
  moveHistory,
  currentMoveIndex,
  chooseSquare,
  victoryMessage,
  setVictoryMessage,
  currentSubBoard,
  setCurrentMoveIndex,
  gameId
}) => {
  const {currentUser} = useAuth();
  const { socket } = useSocket();

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 md:w-[640px] lg:h-[640px]">
      <div className="flex lg:hidden items-center justify-between w-full px-4">
        <div className="max-w-40 truncate">{opponentUsername}</div>
        <Timer ms={symbol === "X" ? timers.O : timers.X} isCompact />
      </div>
      <div className="w-full">
        <Board
          lastMove={moveHistory[currentMoveIndex - 1]}
          currentMoveSelected={currentMoveIndex === moveHistory.length}
          board={board}
          turn={turn}
          player={symbol}
          chooseSquare={chooseSquare}
          victoryMessage={victoryMessage}
          setVictoryMessage={setVictoryMessage}
          currentSubBoard={currentSubBoard}
        />
      </div>
      <div className="flex lg:hidden items-center justify-between w-full px-4">
        <div className="max-w-40 truncate">{currentUser.username}</div>
        <Timer ms={symbol === "X" ? timers.X : timers.O} isCompact />
      </div>

      <div className="flex flex-col w-full md:w-[640px] lg:w-80 h-full">
        <div className="hidden lg:flex flex-col">
          <Timer
            ms={symbol === "X" ? timers.O : timers.X}
            className="rounded-t-md shadow-2xl w-32"
          />
        </div>
        <div className="flex lg:flex-col flex-col-reverse w-full rounded-r-md bg-gray-800 lg:h-[600px]">
          <div className="hidden lg:flex border-b px-4 items-center font-medium">
            <div className="max-w-40 truncate">{opponentUsername}</div>
          </div>
          <div className="h-full overflow-x-scroll overflow-y-hidden lg:overflow-y-scroll lg:overflow-x-hidden">
            <div
              className="flex sm:max-w-[640px]
             flex-wrap flex-row lg:flex-col max-h-fit
              lg:overflow-x-hidden lg:w-80"
            >
              {moveHistory
                .reduce(
                  (acc, move, index) => {
                    const movePairIndex = Math.floor(index / 2);
                    if (!acc[movePairIndex]) {
                      acc[movePairIndex] = [];
                    }
                    acc[movePairIndex].push(move);
                    return acc;
                  },
                  [] as {
                    subBoardIndex: number;
                    squareIndex: number;
                    player: string;
                  }[][],
                )
                .map((movePair, pairIndex) => (
                  <div key={pairIndex} className="flex items-center">
                    <div
                      className="border-r border-l lg:border-l-0
                     border-white/10 bg-white/5 text-white/40 min-w-12"
                    >
                      {pairIndex + 1}
                    </div>
                    <div className="flex flex-row bg-gray-800 w-full justify-start">
                      {movePair.map((move, index) => (
                        <div
                          key={index}
                          className={`flex flex-1 max-w-[120px] justify-between cursor-pointer
                        pr-8 lg:pr-12 hover:bg-white/10 items-center text-[16px]
                        ${move.player === "X" ? "text-color-symbols-x" : "text-color-symbols-o"}
                        ${
                            pairIndex * 2 + index + 1 === currentMoveIndex
                              ? "bg-white/25 font-bold"
                              : "font-medium"
                          }`}
                          onClick={() =>
                            setCurrentMoveIndex(pairIndex * 2 + index + 1)
                          }
                        >
                          <div className="w-8">
                            {move.subBoardIndex + 1}-{move.squareIndex + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-center gap-4 items-center py-4 lg:py-2">
            <button
              className="disabled:text-white/30 h-full"
              onClick={() => setCurrentMoveIndex(0)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardFast size={20} />
            </button>
            <button
              className="disabled:text-white/30 h-full"
              onClick={() => setCurrentMoveIndex(currentMoveIndex - 1)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardStep size={20} />
            </button>
            <button
              className="disabled:text-white/30 h-full"
              onClick={() => setCurrentMoveIndex(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardStep size={20} />
            </button>
            <button
              className="disabled:text-white/30 h-full"
              onClick={() => setCurrentMoveIndex(moveHistory.length)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardFast size={20} />
            </button>
            <button
              title={moveHistory.length > 1 ? "Resign" : "Abort game"}
              className="disabled:text-white/30 h-full ml-2"
              onClick={() => handleResign(socket, gameId)}
            >
              {moveHistory.length > 1 ? (
                <FaFlag size={20} />
              ) : (
                <ImCross size={20} />
              )}
            </button>
          </div>
          <div className="hidden lg:flex border-t px-4 items-center font-medium">
            <div className="max-w-40 truncate">{currentUser.username}</div>
          </div>
        </div>
        <Timer
          ms={symbol === "X" ? timers.X : timers.O}
          className="rounded-b-md shadow-2xl w-32"
        />
      </div>
    </div>
  );
};