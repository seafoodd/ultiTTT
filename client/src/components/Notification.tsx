import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { useSocket } from "../context/SocketContext";

const Notification = () => {
  const [challenge, setChallenge] = useState<{
    from: string;
    gameId: string;
    gameType: string;
  } | null>(null);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const receiveChallengeListener = (
      {
        from,
        gameId,
        gameType,
      }: {
        from: string;
        gameId: string;
        gameType: string;
      },
      callback: (ack: string) => void,
    ) => {
      callback("ACK");
      setChallenge({ from, gameId, gameType });
      console.log("challenge", from, gameId, gameType);
    };
    socket.on("receiveChallenge", receiveChallengeListener);

    socket.on(
      "challengeResponse",
      ({ to, accepted }: { to: string; accepted: boolean }) => {
        if (accepted) {
          console.log(`Challenge accepted by ${to}`);
        } else {
          console.log(`Challenge declined by ${to}`);
        }
      },
    );

    return () => {
      socket.off("receiveChallenge", receiveChallengeListener);
      socket.off("challengeResponse");
    };
  }, [socket]);

  const respondChallenge = (accepted: boolean) => {
    if (challenge && socket) {
      if (accepted) {
        window.location.href = `/${challenge.gameId}`;
      } else {
        socket.emit("declineChallenge", challenge.gameId, challenge.from);
      }
      setChallenge(null);
    }
  };

  if (!challenge) return null;

  return (
    <div className="fixed rounded-xl bottom-6 right-6 z-50 bg-color-accent-400/75 backdrop-blur-sm">
      <div className="relative py-4 px-6">
        <div className="font-semibold flex">
          <span className="max-w-24 truncate mr-1">{challenge.from}</span>
          challenged you to a {challenge.gameType} game!
        </div>
        <div className="flex font-bold justify-center items-center gap-8">
          <button onClick={() => respondChallenge(true)}>Accept</button>
          <button onClick={() => respondChallenge(false)}>Decline</button>
        </div>
        <CgClose
          size={16}
          className="absolute top-1.5 right-1.5 cursor-pointer"
          onClick={() => respondChallenge(false)}
        />
      </div>
    </div>
  );
};

export default Notification;
