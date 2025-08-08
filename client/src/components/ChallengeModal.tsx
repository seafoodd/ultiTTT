import React, { useState } from "react";
import Button from "../shared/ui/Button";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "@/shared/providers/websocket-provider";

interface ChallengeModalProps {
  username: string;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ username }) => {
  const [gameType, setGameType] = useState<string>("rapid");
  const navigate = useNavigate();
  const { socket } = useWebSocket();

  const sendChallengeRequest = () => {
    if (!socket) return;

    try {
      socket.emit("sendChallenge", gameType, username);
      socket.on(
        "challengeCreated",
        (gameId, callback: (ack: string) => void) => {
          callback("ACK");
          navigate(`/${gameId}`);
        }
      );
    } catch (e) {
      console.error( e);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold truncate max-w-64">Play against {username}</h1>
      <p className="mt-12 font-medium font-xl">Minutes per player:</p>
      <div className="grid grid-cols-2 gap-3 justify-center items-center mt-4">
        <button
          onClick={() => setGameType("bullet")}
          className={`${
            gameType === "bullet"
              ? "bg-color-accent-400 text-white border-color-accent-400"
              : "hover:bg-color-accent-400/50 border-white"
          } text-xl font-bold w-20 h-16 border rounded-md`}
        >
          2 + 1
        </button>
        <button
          onClick={() => setGameType("blitz")}
          className={`${
            gameType === "blitz"
              ? "bg-color-accent-400 text-white border-color-accent-400"
              : "hover:bg-color-accent-400/50 border-white"
          } text-xl font-bold w-20 h-16 border rounded-md`}
        >
          5 + 3
        </button>
        <button
          onClick={() => setGameType("rapid")}
          className={`${
            gameType === "rapid"
              ? "bg-color-accent-400 text-white border-color-accent-400"
              : "hover:bg-color-accent-400/50 border-white"
          } text-xl font-bold w-20 h-16 border rounded-md`}
        >
          10 + 5
        </button>
        <button
          onClick={() => setGameType("standard")}
          className={`${
            gameType === "standard"
              ? "bg-color-accent-400 text-white border-color-accent-400"
              : "hover:bg-color-accent-400/50 border-white"
          } text-xl font-bold w-20 h-16 border rounded-md`}
        >
          15 + 10
        </button>
      </div>
      <Button
        onClick={sendChallengeRequest}
        className="bg-color-accent-400 mt-auto mb-4 py-2 w-32 hover:bg-color-accent-500"
      >
        Challenge
      </Button>
    </div>
  );
};

export default ChallengeModal;
