import { useState } from "react";
import Game from "./Game.jsx";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

const JoinGame = () => {
  const [rivalUsername, setRivalUsername] = useState("");
  const [gameId, setGameId] = useState("");
  const [isGameCreated, setIsGameCreated] = useState(false);

  const createGame = () => {
    const newGameId = `${rivalUsername}-${Date.now()}`;
    console.log("created the game with id: ", newGameId);
    setGameId(newGameId);
    setIsGameCreated(true);
    socket.emit("joinGame", newGameId);
  };

  const joinGame = () => {
    console.log("joined the game with id: ", gameId);
    setGameId(gameId);
    setIsGameCreated(true);
    socket.emit("joinGame", gameId);
  };

  return (
    <>
      {gameId && isGameCreated ? (
        <Game socket={socket} gameId={gameId} />
      ) : (
        <div>
          <h4>Create or Join Game</h4>
          <input
            placeholder="username of rival..."
            onChange={(event) => {
              setRivalUsername(event.target.value);
            }}
          />
          <button onClick={createGame}>Create Game</button>
          <input
            placeholder="game ID..."
            onChange={(event) => {
              setGameId(event.target.value);
            }}
          />
          <button onClick={joinGame}>Join Game</button>
        </div>
      )}
    </>
  );
};

export default JoinGame;
