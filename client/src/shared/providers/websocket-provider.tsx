import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { debugError } from "@/shared/lib/client/debugUtils";
import { useAuth } from "@/shared/providers/auth-provider";
import { Env } from "@/shared/constants/env";

interface SocketContextType {
  legacySocket: Socket | null;
  getSocket: (namespace: string) => Socket | null;
}

export enum Namespace {
  presence = "presence",
}

const WebsocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

export const WebsocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [legacySocket, setLegacySocket] = useState<Socket | null>(null);
  const { token } = useAuth();
  const socketsRef = React.useRef<Map<string, Socket>>(new Map());

  useEffect(() => {
    const apiUrl = Env.VITE_API_URL;

    const socketUrl = apiUrl.endsWith("/api")
      ? `${apiUrl.replace("/api", "")}`
      : `${apiUrl}`;

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      path: Env.VITE_ENV === "development" ? undefined : "/sockets/socket.io",
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

    setLegacySocket(newSocket);

    return () => {
      legacySocket?.close();
      socketsRef.current.forEach((s) => s.close());
      socketsRef.current.clear();
    };
  }, [token]);

  const getSocket = React.useCallback(
    (namespace: string) => {
      if (!token) return null;
      const apiUrl = Env.VITE_API_V2_URL;
      const base = apiUrl.endsWith("/api")
        ? `${apiUrl.replace("/api", "")}`
        : `${apiUrl}`;

      const existing = socketsRef.current.get(namespace);
      if (existing) {
        if (existing.connected) {
          return existing;
        }

        try {
          existing.close();
        } catch (e) {
          console.log("socket error", e);
        }
        socketsRef.current.delete(namespace);
      }

      const ns = namespace.startsWith("/") ? namespace : `/${namespace}`;

      const nsSocket = io(`${base}${ns}`, {
        auth: { token },
        path: Env.VITE_ENV === "development" ? undefined : "/sockets/socket.io",
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
      });

      nsSocket.on("connect_error", (err) =>
        console.error(`[${namespace}] connect_error:`, err.message),
      );
      nsSocket.on("error", (err: any) => debugError(err.code, err.message));

      socketsRef.current.set(namespace, nsSocket);
      return nsSocket;
    },
    [token],
  );

  return (
    <WebsocketContext.Provider value={{ legacySocket, getSocket }}>
      {children}
    </WebsocketContext.Provider>
  );
};

export const useLegacySocket = () => {
  const ctx = useContext(WebsocketContext);
  if (!ctx) throw new Error("useLegacySocket must be used within a WebsocketProvider");
  return ctx.legacySocket;
};

export const useSocket = (namespace: Namespace) => {
  const ctx = useContext(WebsocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a WebsocketProvider");
  }

  return ctx.getSocket(namespace);
};
