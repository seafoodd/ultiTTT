import { useState, ChangeEvent } from "react";
import Game from "./Game";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL);

const JoinGame: React.FC = () => {
  const [rivalUsername, setRivalUsername] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const [isGameCreated, setIsGameCreated] = useState<boolean>(false);

  const createGame = () => {
    const newGameId = `${rivalUsername}`;
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

  const handleRivalUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRivalUsername(event.target.value);
  };

  const handleGameIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGameId(event.target.value);
  };

  return (
    <>
      {gameId && isGameCreated ? (
        <Game socket={socket} gameId={gameId} />
      ) : (
        <div className="flex flex-col mt-32">
          <h4>Create or Join Game</h4>
          <div className="flex flex-col gap-4 mt-16">
            <div className="flex gap-4">
              <input
                placeholder="username of rival..."
                onChange={handleRivalUsernameChange}
              />
              <button onClick={createGame}>Create Game</button>
            </div>
            <div className="flex gap-4">
              <input placeholder="game ID..." onChange={handleGameIdChange} />
              <button onClick={joinGame}>Join Game</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinGame;
