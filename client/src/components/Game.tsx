import { useEffect, useState } from "react";
import Board from "./Board";

interface GameProps {
  socket: any;
  gameId: string;
}

interface GameState {
  board: string[];
  player: string;
  turn: string;
  victoryMessage: string;
  playersJoined: boolean;
  players: { id: string; symbol: string }[];
}

const Game: React.FC<GameProps> = ({ socket, gameId }) => {
  const [playersJoined, setPlayersJoined] = useState<boolean>(false);
  // prettier-ignore
  const [board, setBoard] = useState<string[]>([
    "", "", "",
    "", "", "",
    "", "", ""
  ]);
  const [player, setPlayer] = useState<string>("");
  const [turn, setTurn] = useState<string>("X");
  const [victoryMessage, setVictoryMessage] = useState<string>("");

  useEffect(() => {
    const handleGameState = (gameState: GameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
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

    socket.on("gameState", (gameState: GameState) => {
      if (!playersJoined && gameState.players.length === 2) {
        setPlayersJoined(true);
      }
      handleGameState(gameState);
    });
    socket.on("gameResult", handleGameResult);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameResult", handleGameResult);
    };
  }, [socket, playersJoined]);

  const chooseSquare = (square: number) => {
    if (turn === player && board[square] === "") {
      socket.emit("makeMove", { gameId, square, player });
    }
  };

  if (!playersJoined) {
    return <div>Waiting for other player to join...</div>;
  }

  return (
    <>
      <Board
        board={board}
        turn={turn}
        player={player}
        chooseSquare={chooseSquare}
        victoryMessage={victoryMessage}
      />
      {/*CHAT*/}
      {/*LEAVE GAME BUTTON*/}
    </>
  );
};

export default Game;
