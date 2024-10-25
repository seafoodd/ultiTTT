import { useState, useEffect } from "react";
import Board from "./Board.jsx";
import { Patterns } from "../constants/WinningPatterns.js";

const Game = ({ socket, gameId }) => {
  const [playersJoined, setPlayersJoined] = useState(false);
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [player, setPlayer] = useState("");
  const [turn, setTurn] = useState("X");

  const [result, setResult] = useState({ winner: "none", state: "none" });

  const [victoryMessage, setVictoryMessage] = useState("");

  useEffect(() => {
    if (!checkWin()) {
      checkTie();
    }
  }, [board]);

  useEffect(() => {
    const handleGameState = (gameState) => {
      setBoard(gameState.board);
      setTurn(gameState.turn);
      const currentPlayer = gameState.players.find((p) => p.id === socket.id);
      if (currentPlayer) {
        setPlayer(currentPlayer.symbol);
      }
    };
    socket.on("gameState", (gameState) => {
      console.log("update gameState");
      if (!playersJoined && gameState.players.length === 2) {
        setPlayersJoined(true);
      }
      handleGameState(gameState);
    });

    return () => {
      socket.off("gameState", handleGameState);
    };
  }, [socket]);

  const chooseSquare = async (square) => {
    if (result.state === "Won") {
      console.log("The game has already finished!");
      return;
    }

    if (turn !== player) {
      console.log(`It's not your turn! ${player} ${turn}`);
      return;
    }

    if (board[square] !== "") {
      console.log("The square is already occupied!");
      return;
    }

    console.log("set square ", square, player);
    socket.emit("makeMove", { gameId, square, player });
  };

  const checkWin = () => {
    for (let i = 0; i < Patterns.length; i++) {
      const [a, b, c] = Patterns[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        console.log(`Player ${board[a]} wins!`);
        setVictoryMessage(`Player ${board[a]} wins!`);
        setResult({ winner: board[a], state: "Won" });
        return true;
      }
    }
    return false;
  };

  const checkTie = () => {
    let filled = true;
    board.forEach((square) => {
      if (square === "") {
        filled = false;
      }
    });

    if (filled) {
      console.log("Game tied!");
      setVictoryMessage(`Game tied!`);
      setResult({ winner: "none", state: "Tie" });
    }
  };
  if (!playersJoined) {
    return <div>Waiting for other player to join...</div>;
  }

  return (
    <>
      <Board
        result={result}
        setResult={setResult}
        gameId={gameId}
        socket={socket}
        player={player}
        turn={turn}
        board={board}
        chooseSquare={chooseSquare}
        victoryMessage={victoryMessage}
      />
      {/*CHAT*/}
      {/*LEAVE GAME BUTTON*/}
    </>
  );
};

export default Game;
