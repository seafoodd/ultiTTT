import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {CgClose} from "react-icons/cg";

interface NotificationProps {
  socket: Socket;
}

const Notification: React.FC<NotificationProps> = ({ socket }) => {
  const [challenge, setChallenge] = useState<{
    from: string;
    gameId: string;
    gameType: string;
  } | null>(null);

  useEffect(() => {
    socket.on(
      "receiveChallenge",
      ({
        from,
        gameId,
        gameType,
      }: {
        from: string;
        gameId: string;
        gameType: string;
      }) => {
        setChallenge({ from, gameId, gameType });
        console.log("challenge", from, gameId, gameType);
      },
    );

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
      socket.off("receiveChallenge");
      socket.off("challengeResponse");
      socket.off("challengeDeclined");
    };
  }, [socket]);

  const respondChallenge = (accepted: boolean) => {
    if (challenge) {
      if (accepted) {
        window.location.href = `/${challenge.gameId}`;
      } else {
        socket.emit(
          "declineChallenge",
          challenge.gameId,
          challenge.from,
        );
      }
      setChallenge(null);
    }
  };

  if (!challenge) return null;

  return (
    <div className="fixed rounded-xl bottom-6 right-6 z-50 bg-color-blue-2">
      <div className='relative py-4 px-6'>
        <p className="font-semibold">
          {challenge.from} challenged you to a {challenge.gameType} minute game!
        </p>
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
