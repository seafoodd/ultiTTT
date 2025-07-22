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
import { useWebSocket } from "@/shared/provider/websocket-provider";
import { handleResign } from "@/shared/lib/client/gameUtils";
import MoveHistory from "./MoveHistory";
import { useAuth } from "@/shared/provider/auth-provider";

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
  gameFinished: boolean;
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
  gameId,
  gameFinished,
}) => {
  const { currentUser } = useAuth();
  const { socket } = useWebSocket();

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 sm:w-[640px] lg:h-[640px] -mt-2 sm:mt-8">
      <div className="flex lg:hidden items-center justify-between w-full px-4">
        <div className="max-w-40 truncate">{opponentUsername}</div>
        <Timer ms={symbol === "X" ? timers.O : timers.X} isCompact />
      </div>
      <div className="w-full">
        <Board
          gameFinished={gameFinished}
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
        <div className="z-30 fixed left-0 bottom-0 lg:relative lg:bottom-auto lg:left-auto flex lg:flex-col flex-col-reverse w-full lg:rounded-r-md bg-color-neutral-800 lg:h-[600px]">
          <div className="hidden lg:flex border-b-2 border-color-accent-300 px-4 items-center font-medium">
            <div className="max-w-40 truncate">{opponentUsername}</div>
          </div>
          <div className="h-full overflow-y-hidden lg:overflow-y-scroll lg:overflow-x-hidden">
            <MoveHistory
              moveHistory={moveHistory}
              currentMoveIndex={currentMoveIndex}
              setCurrentMoveIndex={setCurrentMoveIndex}
            />
          </div>
          <div className="flex justify-center gap-4 items-center py-2 lg:py-2">
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
          <div className="hidden lg:flex border-t-2 border-color-accent-300 px-4 items-center font-medium">
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
