import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { debugError } from "@/shared/lib/client/debugUtils";
import { useAuth } from "@/shared/provider/auth-provider";
import { Env } from "@/shared/constants/env";

interface SocketContextType {
  socket: Socket | null;
}

const WebsocketSocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

export const WebsocketSocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const apiUrl = Env.VITE_API_URL;
    const socketUrl = apiUrl.endsWith("/api")
      ? `${apiUrl.replace("/api", "")}`
      : `${apiUrl}`;

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      path:
        Env.VITE_ENV === "development"
          ? undefined
          : "/sockets/socket.io",
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    newSocket.on("error", (err) => {
      debugError(err.code, err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <WebsocketSocketContext.Provider value={{ socket }}>
      {children}
    </WebsocketSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebsocketSocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
