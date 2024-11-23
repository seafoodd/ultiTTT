import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import {
  BiSignal1,
  BiSignal2,
  BiSignal3,
  BiSignal4,
  BiSignal5,
} from "react-icons/bi";

interface PingDisplayProps {
  socket: Socket;
  className?: string;
}

const getSignalIcon = (ping: number) => {
  if (ping < 200) {
    return <BiSignal5 size={24} className="fill-color-green-1" />;
  } else if (ping < 400) {
    return <BiSignal4 size={24} className="fill-color-green-1" />;
  } else if (ping < 600) {
    return <BiSignal3 size={24} className="fill-yellow-300" />;
  } else if (ping < 800) {
    return <BiSignal2 size={24} className="fill-red-800" />;
  } else {
    return <BiSignal1 size={24} className="fill-red-800" />;
  }
};

const PingDisplay: React.FC<PingDisplayProps> = ({ socket, className }) => {
  const [ping, setPing] = useState<number | null>(null);

  useEffect(() => {
    const handlePing = () => {
      const start = Date.now();
      socket.emit("ping", () => {
        const latency = Date.now() - start;
        setPing(Math.max(latency, 1));
      });
    };

    const interval = setInterval(handlePing, 1000);

    return () => clearInterval(interval);
  }, [socket]);

  return (
    <div
      className={`${className ? className : ""} flex w-full h-full gap-1.5 items-center`}
    >
      {ping ? getSignalIcon(ping) : <BiSignal1 size={24} className="fill-red-800" />}
      <span>
        <span className="font-semibold">{ping || "-"}</span> ms
      </span>
    </div>
  );
};

export default PingDisplay;
