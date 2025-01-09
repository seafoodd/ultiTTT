import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBoardAtMove } from "../utils/gameUtils";
import { useSocket } from "../context/SocketContext";
import NotFound from "./NotFound";
import WaitingLobby from "./WaitingLobby";
import LoadingCircle from "./LoadingCircle";
import { GameView } from "./GameView";

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
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket();
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);
  const { gameId } = useParams();
  const location = useLocation();
  const { token, currentUser } = useAuth();
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

    socket.on(
      "challengeDeclined",
      (username, callback: (ack: string) => void) => {
        setIsDeclined(true);
        setOpponentUsername(username);
        callback("ACK");
      },
    );

    const handleError = () => {
      setGameNotFound(true);
    };

    const handleGameState = (
      gameState: GameState,
      callback: (ack: string) => void = () => {},
    ) => {
      callback("ACK");
      setBoard(gameState.board);
      setTurn(gameState.moveHistory.length % 2 === 0 ? "X" : "O");
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
      setLoading(false);
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

  useEffect(() => {
    setBoard(getBoardAtMove(currentMoveIndex, moveHistory));
  }, [currentMoveIndex, moveHistory]);

  if (!gameId || loading) {
    return <LoadingCircle />;
  }

  if (gameNotFound) {
    return <NotFound />;
  }

  if (!playersJoined) {
    return (
      <WaitingLobby
        invitedUsername={invitedUsername}
        isDeclined={isDeclined}
        gameId={gameId}
      />
    );
  }

  return (
    <GameView
      board={board}
      turn={turn}
      timers={timers}
      moveHistory={moveHistory}
      chooseSquare={chooseSquare}
      victoryMessage={victoryMessage}
      setVictoryMessage={setVictoryMessage}
      currentSubBoard={currentSubBoard}
      currentMoveIndex={currentMoveIndex}
      setCurrentMoveIndex={setCurrentMoveIndex}
      symbol={symbol}
      gameId={gameId}
      opponentUsername={opponentUsername}
    />
  );
};

export default Game;
