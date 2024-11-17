import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FaBackwardStep,
  FaForwardStep,
  FaBackwardFast,
  FaForwardFast,
} from "react-icons/fa6";
import Board from "./Board";
import Timer from "./Timer";
import { useAuth } from "../context/AuthContext";
import { Socket } from "socket.io-client";
import { checkSubWinner } from "../utils/gameUtils";

interface GameProps {
  socket: Socket;
}

interface GameState {
  board: { subWinner: string; squares: string[] }[];
  player: string;
  turn: string;
  currentSubBoard: number | null;
  victoryMessage: string;
  playersJoined: boolean;
  moveHistory: { subBoardIndex: number; squareIndex: number; player: string }[];
  players: { id: string; symbol: string; username: string }[];
  timers: { X: number; O: number };
}

const Game: React.FC<GameProps> = ({ socket }) => {
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);
  const { gameId } = useParams();
  const location = useLocation();
  const { token } = useAuth();

  const [board, setBoard] = useState<
    { subWinner: string; squares: string[] }[]
  >(
    Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
  );
  const [timers, setTimers] = useState<{ X: number; O: number }>({
    X: 600,
    O: 600,
  });
  const [moveHistory, setMoveHistory] = useState<
    { subBoardIndex: number; squareIndex: number; player: string }[]
  >([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);

  const [player, setPlayer] = useState<string>("");
  const [opponentUsername, setOpponentUsername] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [turn, setTurn] = useState<string>("X");
  const [currentSubBoard, setCurrentSubBoard] = useState<number | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string>("");

  useEffect(() => {
    socket.emit("joinGame", gameId, token);
    console.log("joined the game with id: ", gameId);

    const handleGameState = (gameState: GameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
      setMoveHistory(gameState.moveHistory);
      setCurrentMoveIndex(gameState.moveHistory.length);
      setCurrentSubBoard(gameState.currentSubBoard);
      setTimers(gameState.timers);
      const currentPlayer = gameState.players.find(
        (p: any) => p.id === socket.id,
      );
      if (currentPlayer) {
        setPlayer(currentPlayer.symbol);
        setCurrentUsername(currentPlayer.username);
      }
      if (gameState.players.length === 2) {
        setPlayersJoined(true);
      }

      setOpponentUsername(
        gameState.players.find((p) => p.id !== socket.id)?.username ||
          "Opponent",
      );
    };

    const handleGameResult = (result: any) => {
      setVictoryMessage(
        result.winner === "none"
          ? "Game tied!"
          : `Player ${result.winner} wins!`,
      );
    };

    const handleTimerUpdate = (updatedTimers: { X: number; O: number }) => {
      setTimers(updatedTimers);
      console.log("handleTimers");
    };

    socket.on("gameState", handleGameState);
    socket.on("gameResult", handleGameResult);
    socket.on("timerUpdate", handleTimerUpdate);

    // Fetch the current game state on component mount
    socket.emit("getGameState", gameId, (gameState: GameState) => {
      handleGameState(gameState);
    });

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameResult", handleGameResult);
      socket.off("timerUpdate", handleTimerUpdate);
    };
  }, [gameId, token, socket, location]);

  const chooseSquare = (subBoardIndex: number, squareIndex: number) => {
    if (turn === player && board[subBoardIndex].squares[squareIndex] === "") {
      socket.emit("makeMove", { gameId, subBoardIndex, squareIndex, player });
    }
  };

  const getBoardAtMove = (moveIndex: number) => {
    const newBoard = Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    }));

    if (moveHistory) {
      moveHistory.slice(0, moveIndex).forEach((move) => {
        newBoard[move.subBoardIndex].squares[move.squareIndex] = move.player;
        newBoard[move.subBoardIndex].subWinner = checkSubWinner(
          newBoard[move.subBoardIndex].squares,
        );
      });
    }

    return newBoard;
  };

  useEffect(() => {
    setBoard(getBoardAtMove(currentMoveIndex));
  }, [currentMoveIndex, moveHistory]);

  if (!playersJoined) {
    return <div>Waiting for other player to join...</div>;
  }

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 md:w-[640px] lg:h-[640px]">
      <div className="flex lg:hidden items-center justify-between w-full px-4">
        <div>{opponentUsername}</div>
        <Timer seconds={player === "X" ? timers.O : timers.X} isCompact />
      </div>
      <div className="w-full">
        <Board
          lastMove={moveHistory[currentMoveIndex - 1]}
          currentMoveSelected={currentMoveIndex === moveHistory.length}
          board={board}
          turn={turn}
          player={player}
          chooseSquare={chooseSquare}
          victoryMessage={victoryMessage}
          currentSubBoard={currentSubBoard}
        />
      </div>
      <div className="flex lg:hidden items-center justify-between w-full px-4">
        <div>{currentUsername}</div>
        <Timer seconds={player === "X" ? timers.X : timers.O} isCompact />
      </div>
      <div className="flex flex-col w-full md:w-[640px] lg:w-80 h-full">
        <div className="hidden lg:flex flex-col ">
          <Timer
            seconds={player === "X" ? timers.O : timers.X}
            className="rounded-t-md shadow-2xl w-32"
          />
        </div>
        <div className="flex flex-col w-full rounded-r-md bg-gray-800 lg:h-[600px]">
          <div className="hidden lg:flex border-b px-4 items-center font-medium">
            {opponentUsername}
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
          <div className="flex justify-center gap-8 items-center py-2">
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(0)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardFast />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(currentMoveIndex - 1)}
              disabled={currentMoveIndex <= 0}
            >
              <FaBackwardStep />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(currentMoveIndex + 1)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardStep />
            </button>
            <button
              className="disabled:text-white/30"
              onClick={() => setCurrentMoveIndex(moveHistory.length)}
              disabled={currentMoveIndex >= moveHistory.length}
            >
              <FaForwardFast />
            </button>
          </div>
          <div className="hidden lg:flex border-t px-4 items-center font-medium">
            {currentUsername}
          </div>
        </div>
        <Timer
          seconds={player === "X" ? timers.X : timers.O}
          className="rounded-b-md shadow-2xl w-32"
        />
      </div>
    </div>
  );
};

export default Game;
