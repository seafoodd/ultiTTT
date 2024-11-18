import React, { useState } from "react";
import Button from "./Button";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface ChallengeModalProps {
  username: string;
  socket: Socket;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  username,
  socket,
}) => {
  const [gameType, setGameType] = useState<string>("10");
  const navigate = useNavigate();

  const sendChallengeRequest = () => {
    socket.emit("sendChallenge", gameType, username);
    socket.on("challengeCreated", (gameId) => {
      navigate(`/${gameId}`);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold">Play against {username}</h1>
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
