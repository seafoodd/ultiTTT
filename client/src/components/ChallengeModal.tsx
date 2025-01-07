import React, { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

interface ChallengeModalProps {
  username: string;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ username }) => {
  const [gameType, setGameType] = useState<string>("10");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const sendChallengeRequest = () => {
    if (!socket) return;

    try {
      socket.emit("sendChallenge", gameType, username);
      socket.on(
        "challengeCreated",
        (gameId, callback: (ack: string) => void) => {
          callback("ACK");
          navigate(`/${gameId}`);
        },
      );
    } catch (e) {
      console.error(123, e);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold truncate max-w-64">Play against {username}</h1>
      <p className="mt-20 font-semibold">Minutes per player:</p>
      <div className="flex gap-3 justify-center items-center mt-4">
        <button
          onClick={() => setGameType("5")}
          className={`${gameType === "5" ? "bg-color-blue-2" : "hover:bg-color-blue-2/50"} font-bold w-20 h-16 border-2 border-white rounded-md`}
        >
          5
        </button>
        <button
          onClick={() => setGameType("10")}
          className={`${gameType === "10" ? "bg-color-blue-2" : "hover:bg-color-blue-2/50"} font-bold w-20 h-16 border-2 border-white rounded-md`}
        >
          10
        </button>
        <button
          onClick={() => setGameType("15")}
          className={`${gameType === "15" ? "bg-color-blue-2" : "hover:bg-color-blue-2/50"} font-bold w-20 h-16 border-2 border-white rounded-md`}
        >
          15
        </button>
      </div>
      <Button
        onClick={sendChallengeRequest}
        text="Challenge"
        className="bg-color-blue-2 mt-auto mb-4 py-2 w-32 hover:bg-color-blue-2/75"
      />
    </div>
  );
};

export default ChallengeModal;
