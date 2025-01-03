import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import Axios from "axios";
import {useSocket} from "./SocketContext";

interface StoreContextProps {
  friends: string[];
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  fetchFriends: Function;
  sendFriendRequest: Function;
  onlineFriends: string[];
  setOnlineFriends: React.Dispatch<React.SetStateAction<string[]>>;
  activeGames: any[];
  setActiveGames: React.Dispatch<React.SetStateAction<any[]>>;
  incomingRequests: any[];
  outgoingRequests: any[];
  loading: boolean;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuth } = useAuth();
  const [friends, setFriends] = useState<string[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<
    { username: string; id: string }[]
  >([]);
  const [outgoingRequests, setOutgoingRequests] = useState<
    { username: string; id: string }[]
  >([]);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuth) return;
    fetchFriends().catch((err) => {
      console.error(err);
    });
  }, [token, isAuth]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/friends`, {
        headers: { Authorization: token! },
      });
      if (!response.ok) {
        return console.error("Error fetching friends");
      }
      const data = await response.json();
      setFriends(data.friends);

      checkOnlineStatus(data.friends)

      setIncomingRequests(
        data.incomingRequests.map(
          (r: { id: string; toUsername: string; fromUsername: string }) => ({
            id: r.id,
            username: r.fromUsername,
          }),
        ),
      );
      setOutgoingRequests(
        data.outgoingRequests.map(
          (r: { id: string; toUsername: string; fromUsername: string }) => ({
            id: r.id,
            username: r.toUsername,
          }),
        ),
      );
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = (username: string, action: "add" | "remove") => {
    Axios.post(
      `${import.meta.env.VITE_API_URL}/friends/${action}/${username}`,
      {},
      {
        headers: {
          Authorization: token!,
        },
      },
    )
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        console.error(e.message);
      })
      .finally(fetchFriends);
  };

  const checkOnlineStatus = (friends: string[]) => {
    friends.forEach((friend) => {
      socket && socket.emit("isUserOnline", friend, (online: boolean) => {
        setOnlineFriends((prev) =>
          online ? [...prev, friend] : prev.filter((f) => f !== friend),
        );
      });
    });
  };

  return (
    <StoreContext.Provider
      value={{
        friends,
        setFriends,
        fetchFriends,
        sendFriendRequest,
        onlineFriends,
        setOnlineFriends,
        activeGames,
        setActiveGames,
        incomingRequests,
        outgoingRequests,
        loading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};