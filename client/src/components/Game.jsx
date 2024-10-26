import { useState, useEffect } from "react";
import Board from "./Board.jsx";

const Game = ({ socket, gameId }) => {
  const [playersJoined, setPlayersJoined] = useState(false);
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [player, setPlayer] = useState("");
  const [turn, setTurn] = useState("X");
  const [victoryMessage, setVictoryMessage] = useState("");

  useEffect(() => {
    const handleGameState = (gameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
      const currentPlayer = gameState.players.find((p) => p.id === socket.id);
      if (currentPlayer) {
        setPlayer(currentPlayer.symbol);
      }
    };

    const handleGameResult = (result) => {
      setVictoryMessage(
        result.state === "Won" ? `Player ${result.winner} wins!` : "Game tied!",
      );
    };

    socket.on("gameState", (gameState) => {
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
  }, [socket]);

  const chooseSquare = (square) => {
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
