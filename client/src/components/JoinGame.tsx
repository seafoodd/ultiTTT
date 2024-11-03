import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import verifyToken from "../utils/verifyToken";

const JoinGame = () => {
  const [gameId, setGameId] = useState<string>("");
  const navigate = useNavigate();

  const joinGame = async () => {
    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    try {
      navigate(`/${gameId}`);
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const handleGameIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGameId(event.target.value);
  };

  return (
    <div className="flex flex-col mt-32 gap-8 items-center">
      <h4>Create or Join Game</h4>
      <div className="flex gap-4">
        <input placeholder="game ID..." onChange={handleGameIdChange} />
        <button onClick={joinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default JoinGame;
