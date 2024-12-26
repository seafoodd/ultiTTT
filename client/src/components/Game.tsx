import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaBackwardStep,
  FaForwardStep,
  FaBackwardFast,
  FaForwardFast,
} from "react-icons/fa6";
import Board from "./Board";
import Timer from "./Timer";
import { useAuth } from "../context/AuthContext";
import { checkSubWinner } from "../utils/gameUtils";
import Button from "./Button";
import { BiHome } from "react-icons/bi";
import { useSocket } from "../context/SocketContext";

interface GameState {
  board: { subWinner: string; squares: string[] }[];
  player: string;
  turn: string;
  currentSubBoard: number | null;
  victoryMessage: string;
  playersJoined: boolean;
  moveHistory: { subBoardIndex: number; squareIndex: number; player: string }[];
  players: Player[];
  timers: { X: number; O: number };
  invitedUsername: string;
}

interface Player {
  username: string;
  symbol: string;
}

const Game = () => {
  const { socket } = useSocket();
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);
  const { gameId } = useParams();
  const location = useLocation();
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [board, setBoard] = useState<
    { subWinner: string; squares: string[] }[]
  >(
    Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    })),
  );
  const [timers, setTimers] = useState<{ X: number; O: number }>({
    X: 600 * 1000,
    O: 600 * 1000,
  });
  const [moveHistory, setMoveHistory] = useState<
    { subBoardIndex: number; squareIndex: number; player: string }[]
  >([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);

  const [symbol, setSymbol] = useState<string>("");
  const [invitedUsername, setInvitedUsername] = useState<string>("");
  const [opponentUsername, setOpponentUsername] = useState<string>("");
  const [turn, setTurn] = useState<string>("X");
  const [currentSubBoard, setCurrentSubBoard] = useState<number | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string>("");
  const [isDeclined, setIsDeclined] = useState<boolean>(false);
  const [gameNotFound, setGameNotFound] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;
    let start: number;

    const updateTimers = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        if (newTimers[turn as "X" | "O"] > 0) {
          newTimers[turn as "X" | "O"] -= elapsed;
        }
        return newTimers;
      });

      start = timestamp;
      animationFrameId = requestAnimationFrame(updateTimers);
    };

    if (gameFinished || moveHistory.length < 2) {
      return;
    }

    animationFrameId = requestAnimationFrame(updateTimers);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [turn, victoryMessage, moveHistory, gameFinished]);

  useEffect(() => {
    if (!socket) return;
    if (!currentUser) return;

    socket.emit("joinGame", gameId);

    socket.on("challengeDeclined", () => {
      setIsDeclined(true);
    });

    const handleError = () => {
      setGameNotFound(true);
    };

    const handleGameState = (
      gameState: GameState,
      callback: (ack: string) => void = () => {},
    ) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
      setMoveHistory(gameState.moveHistory);
      const opponent = gameState.players.find(
        (p) => p.username !== currentUser.username,
      );
      if (opponent) {
        setOpponentUsername(opponent.username);
      }
      setCurrentMoveIndex(gameState.moveHistory.length);
      setCurrentSubBoard(gameState.currentSubBoard);
      setInvitedUsername(gameState.invitedUsername);
      setTimers(gameState.timers);
      const currentPlayer = gameState.players.find(
        (p: Player) => p.username === currentUser.username,
      );
      if (currentPlayer) {
        setSymbol(currentPlayer.symbol);
      }
      if (gameState.players.length === 2) {
        setPlayersJoined(true);
      }
      callback("acknowledged");
    };

    const handleGameResult = (result: any) => {
      setVictoryMessage(
        result.winner === "none"
          ? result.status === "aborted"
            ? "Game aborted!"
            : "Game tied!"
          : `Player ${result.winner} wins!`,
      );
      setGameFinished(true);
    };

    socket.on("gameState", handleGameState);
    socket.on("error", handleError);
    socket.on("gameResult", handleGameResult);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameResult", handleGameResult);
    };
  }, [gameId, token, socket, location, currentUser]);

  const chooseSquare = (subBoardIndex: number, squareIndex: number) => {
    if (!socket) return;

    if (turn !== symbol || board[subBoardIndex].squares[squareIndex] !== "") {
      console.log(`Not a valid move: ${turn} !== ${symbol}`);
      return;
    }

    socket.emit("makeMove", { gameId, subBoardIndex, squareIndex });
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

  if (gameNotFound) {
    return (
      <div className="mt-8 flex flex-col justify-center items-center">
        <h1 className="font-semibold text-xl">404 - Game Not Found</h1>
        <Button
          text="Home"
          icon={<BiHome />}
          onClick={() => navigate("/home")}
          className="bg-color-blue-2 px-2 py-2 mt-2"
        />
      </div>
    );
  }

  if (!playersJoined) {
    return isDeclined ? (
      <div className="mt-8 flex flex-col justify-center items-center">
        <h1 className="font-semibold text-xl">
          {invitedUsername ? (
            <span className="max-w-40 truncate">{invitedUsername}</span>
          ) : (
            "opponent"
          )}{" "}
          declined the challenge
        </h1>
        <Button
          text="Home"
          icon={<BiHome />}
          onClick={() => navigate("")}
          className="bg-color-blue-2 px-2 py-2 mt-2"
        />
      </div>
    ) : (
      <div>
        <h1 className="flex">
          Waiting for{" "}
          {invitedUsername ? (
            <span className="max-w-40 truncate font-semibold mx-1">
              {invitedUsername}
            </span>
          ) : (
            "opponent"
          )}{" "}
          to join...
        </h1>
      </div>
    );
  }

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
        <div className="flex flex-col w-full rounded-r-md bg-gray-800 lg:h-[600px]">
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

export default Game;
