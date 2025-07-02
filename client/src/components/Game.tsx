import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getBoardAtMove } from "@/shared/lib/client/gameUtils";
import { useWebSocket } from "../shared/provider/websocket-provider";
import NotFound from "../pages/NotFound";
import WaitingLobby from "./WaitingLobby";
import LoadingCircle from "./LoadingCircle";
import { GameView } from "./GameView";
import { playSound } from "@/shared/lib/client//soundUtils";
import { useAuth } from "@/shared/provider/auth-provider";

interface GameState {
  t: "init" | "move";
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
  identifier: string;
  symbol: string;
}

const Game = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useWebSocket();
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
    }))
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

  const [moveSound] = useState(() => new Audio("/sounds/Move.mp3"));
  const [gameFinishedSound] = useState(
    () => new Audio("/sounds/GameFinished.mp3")
  );

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
      }
    );

    const handleError = () => {
      setLoading(false);
      setGameNotFound(true);
    };

    const handleGameState = (
      gameState: GameState,
      callback: (ack: string) => void = () => {}
    ) => {
      callback("ACK");
      console.log(gameState);
      setTurn(gameState.moveHistory.length % 2 === 0 ? "X" : "O");
      setMoveHistory(gameState.moveHistory);
      setCurrentMoveIndex(gameState.moveHistory.length);
      setTimers(gameState.timers);

      if (gameState.t === "init") {
        setInvitedUsername(gameState.invitedUsername);

        const opponent = gameState.players.find(
          (player) => player.identifier !== currentUser.identifier
        );
        if (opponent) {
          setOpponentUsername(opponent.username);
        }
        const currentPlayer = gameState.players.find(
          (p: Player) => p.identifier === currentUser.identifier
        );
        // console.log("currentPlayer", currentPlayer)
        if (currentPlayer) {
          setSymbol(currentPlayer.symbol);
        }
        if (gameState.players.length === 2) {
          setPlayersJoined(true);
        }
      }

      const newBoard = getBoardAtMove(
        gameState.moveHistory.length,
        gameState.moveHistory
      );
      setBoard(newBoard);
      const lastSquareIndex =
        gameState.moveHistory.length > 0
          ? gameState.moveHistory[gameState.moveHistory.length - 1].squareIndex
          : null;
      setCurrentSubBoard(
        lastSquareIndex !== null && newBoard[lastSquareIndex].subWinner === ""
          ? lastSquareIndex
          : null
      );

      if (gameState.t === "move") {
        console.log("play sound 1", gameState);
        playSound(moveSound);
      }

      setLoading(false);
    };

    const handleGameResult = (result: any) => {
      setVictoryMessage(
        result.winner === "none"
          ? result.status === "aborted"
            ? "Game aborted!"
            : "Game tied!"
          : `Player ${result.winner} wins!`
      );

      playSound(gameFinishedSound);
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
    if (!socket || gameFinished) return;

    if (turn !== symbol || board[subBoardIndex].squares[squareIndex] !== "") {
      console.log(`Not a valid move: ${turn} !== ${symbol}`);
      return;
    }

    // console.log("play sound 2")
    // playSound(moveSound);
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
      gameFinished={gameFinished}
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
