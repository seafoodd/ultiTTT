import { useCallback, useEffect, useRef, useState } from "react";
import {
  BiSignal1,
  BiSignal2,
  BiSignal3,
  BiSignal4,
  BiSignal5,
} from "react-icons/bi";
import { Namespace, useSocket } from "@/shared/providers/websocket-provider";
import { cn } from "@/shared/lib/client/cn";

interface PingDisplayProps {
  className?: string;
}

type PingAck = {
  serverTime?: number;
  rttMs?: number;
};

const PING_INTERVAL_MS = 3000;
const ACK_TIMEOUT_MS = 5000;

const SIGNALS = [
  { limit: 200, Icon: BiSignal5, color: "fill-color-success-500" },
  { limit: 400, Icon: BiSignal4, color: "fill-color-success-500" },
  { limit: 600, Icon: BiSignal3, color: "fill-color-warning-500" },
  { limit: 800, Icon: BiSignal2, color: "fill-color-danger-500" },
  { limit: Infinity, Icon: BiSignal1, color: "fill-color-danger-500" },
] as const;

const getSignalIcon = (ping: number | null) => {
  const match =
    SIGNALS.find(({ limit }) => (ping ?? Infinity) < limit) ??
    SIGNALS[SIGNALS.length - 1];
  const { Icon, color } = match;
  return <Icon size={24} className={color} />;
};

const PingDisplay = ({ className }: PingDisplayProps) => {
  const [ping, setPing] = useState<number | null>(null);
  const socket = useSocket(Namespace.presence);

  const inFlightRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAckTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const sendPing = useCallback(() => {
    if (!socket || !socket.connected || inFlightRef.current) return;
    if (document.hidden) return;

    inFlightRef.current = true;
    const startedAt = performance.now();

    timeoutRef.current = setTimeout(() => {
      inFlightRef.current = false;
      setPing(null);
      if (process.env.NODE_ENV !== "production") {
        console.warn("[PingDisplay] ping timeout");
      }
    }, ACK_TIMEOUT_MS);

    socket.emit("presence:ping", { sentAt: Date.now() }, (ack?: PingAck) => {
      clearAckTimeout();
      inFlightRef.current = false;

      if (!ack) {
        setPing(null);
        return;
      }

      const measured =
        typeof ack.rttMs === "number"
          ? ack.rttMs
          : performance.now() - startedAt;

      const safe = Math.max(1, measured);
      setPing(safe);
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const start = () => {
      if (intervalRef.current) return;
      sendPing();
      intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearAckTimeout();
      inFlightRef.current = false;
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    if (socket.connected) start();
    socket.on("connect", start);
    socket.on("disconnect", stop);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      socket.off("connect", start);
      socket.off("disconnect", stop);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [socket, sendPing]);

  return (
    <div className={cn(className, "flex gap-1.5 items-center w-full h-full")}>
      {getSignalIcon(ping)}
      <span>
        <span className="font-semibold">{ping || "-"}</span> ms
      </span>
    </div>
  );
};

export default PingDisplay;
