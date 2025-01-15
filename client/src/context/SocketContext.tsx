import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "universal-cookie";
import { debugError } from "../utils/debugUtils";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const cookies = new Cookies();
  const token = cookies.get("token");
  console.log(token)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const socketUrl = apiUrl.endsWith("/api")
      ? `${apiUrl.replace("/api", "")}`
      : `${apiUrl}`;

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      path:
        import.meta.env.VITE_ENV === "development"
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
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
