import { useState, ChangeEvent } from "react";
import Game from "./Game";
import { io, Socket } from "socket.io-client";
import verifyToken from "../utils/verifyToken";

const socket: Socket = io(import.meta.env.VITE_API_URL);

interface JoinGameProps {
  token: string;
}

const JoinGame: React.FC<JoinGameProps> = ({ token }) => {
  const [gameId, setGameId] = useState<string>("");
  const [isGameCreated, setIsGameCreated] = useState<boolean>(false);

  const joinGame = async () => {
    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    try {
      setGameId(gameId);
      setIsGameCreated(true);
      socket.emit("joinGame", gameId, token);
      console.log("joined the game with id: ", gameId);
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const handleGameIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGameId(event.target.value);
  };

  return (
    <>
      {gameId && isGameCreated ? (
        <Game socket={socket} gameId={gameId} />
      ) : (
        <>
          <div className="flex flex-col mt-32">
            <h4>Create or Join Game</h4>
            <div className="flex flex-col gap-4 mt-16">
              <div className="flex gap-4">
                <input placeholder="game ID..." onChange={handleGameIdChange} />
                <button onClick={joinGame}>Join Game</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default JoinGame;
