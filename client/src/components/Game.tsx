import { useEffect, useState } from "react";
import Board from "./Board";

interface GameProps {
  socket: any;
  gameId: string;
}

interface GameState {
  board: { subWinner: string; squares: string[] }[];
  player: string;
  turn: string;
  currentSubBoard: number | null;
  victoryMessage: string;
  playersJoined: boolean;
  players: { id: string; symbol: string }[];
}

const Game: React.FC<GameProps> = ({ socket, gameId }) => {
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);

  // prettier-ignore
  const [board, setBoard] = useState<{ subWinner: string; squares: string[] }[]>(
    Array.from({ length: 9 }, () => ({
      subWinner: "",
      squares: Array(9).fill(""),
    }))
  );
  const [timers, setTimers] = useState<{ X: number; O: number }>({ X: 600, O: 600 });
  const [player, setPlayer] = useState<string>("");
  const [turn, setTurn] = useState<string>("X");
  const [currentSubBoard, setCurrentSubBoard] = useState<number | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string>("");

  useEffect(() => {
    const handleGameState = (gameState: GameState) => {
      console.log(gameState.board);
      setBoard(gameState.board);
      setTurn(gameState.turn);
      setCurrentSubBoard(gameState.currentSubBoard);
      const currentPlayer = gameState.players.find(
        (p: any) => p.id === socket.id,
      );
      if (currentPlayer) {
        setPlayer(currentPlayer.symbol);
      }
    };

    const handleGameResult = (result: any) => {
      setVictoryMessage(
        result.state === "Won" ? `Player ${result.winner} wins!` : "Game tied!",
      );
    };

    const handleTimerUpdate = (updatedTimers: { X: number; O: number }) => {
      setTimers(updatedTimers);
    };

    socket.on("gameState", (gameState: GameState) => {
      if (!playersJoined && gameState.players.length === 2) {
        setPlayersJoined(true);
      }
      handleGameState(gameState);
    });
    socket.on("gameResult", handleGameResult);
    socket.on("timerUpdate", handleTimerUpdate);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameResult", handleGameResult);
      socket.off("timerUpdate", handleTimerUpdate);

    };
  }, [socket, playersJoined]);

  const chooseSquare = (subBoardIndex: number, squareIndex: number) => {
    if (turn === player && board[subBoardIndex].squares[squareIndex] === "") {
      console.log(`played the move ${subBoardIndex} ${squareIndex}`);
      socket.emit("makeMove", { gameId, subBoardIndex, squareIndex, player });
    }
  };

  if (!playersJoined) {
    return <div>Waiting for other player to join...</div>;
  }

  return (
    <>
      <div className="ml-36 w-full flex items-center justify-between">
        <Board
          board={board}
          turn={turn}
          player={player}
          chooseSquare={chooseSquare}
          victoryMessage={victoryMessage}
          currentSubBoard={currentSubBoard}
        />
        <div className="flex flex-col gap-4 ">
          <div>Turn: {turn}</div>
          <div>Current subBoard: {currentSubBoard}</div>
          <div>Playing as {player}</div>
          <div>Timer X: {timers.X} seconds</div>
          <div>Timer O: {timers.O} seconds</div>
        </div>
      </div>
      {/*CHAT*/}
      {/*LEAVE GAME BUTTON*/}
    </>
  );
};

export default Game;
