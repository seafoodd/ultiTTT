import React, { useEffect, useState } from "react";
import {
  BiSignal1,
  BiSignal2,
  BiSignal3,
  BiSignal4,
  BiSignal5,
} from "react-icons/bi";
import { useSocket } from "../context/SocketContext";

interface PingDisplayProps {
  className?: string;
}

const getSignalIcon = (ping: number) => {
  if (ping < 200) {
    return <BiSignal5 size={24} className="fill-color-success-500" />;
  } else if (ping < 400) {
    return <BiSignal4 size={24} className="fill-color-success-500" />;
  } else if (ping < 600) {
    return <BiSignal3 size={24} className="fill-color-warning-500" />;
  } else if (ping < 800) {
    return <BiSignal2 size={24} className="fill-color-danger-500" />;
  } else {
    return <BiSignal1 size={24} className="fill-color-danger-500" />;
  }
};

const PingDisplay: React.FC<PingDisplayProps> = ({ className }) => {
  const [ping, setPing] = useState<number | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    const handlePing = () => {
      if (!socket) return;

      const start = Date.now();
      let timeoutId: NodeJS.Timeout;

      const handleResponse = (error: any) => {
        clearTimeout(timeoutId);
        if (error) {
          console.log("ping error");
          setPing(null);
          return;
        }
        const latency = Date.now() - start;
        setPing(Math.max(latency, 1));
      };

      socket.emit("ping", handleResponse);

      timeoutId = setTimeout(() => {
        console.log("ping timeout");
        setPing(null);
      }, 5000); // 5 seconds timeout
    };

    const interval = setInterval(handlePing, 2000);

    return () => clearInterval(interval);
  }, [socket]);

  return (
    <div
      className={`${className ? className : ""} flex w-full h-full gap-1.5 items-center`}
    >
      {ping ? (
        getSignalIcon(ping)
      ) : (
        <BiSignal1 size={24} className="fill-color-danger-500" />
      )}
      <span>
        <span className="font-semibold">{ping || "-"}</span> ms
      </span>
    </div>
  );
};

export default PingDisplay;
