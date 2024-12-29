import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

interface StoreContextProps {
  friends: string[];
  fetchFriends: Function;
  activeGames: any[];
  setActiveGames: React.Dispatch<React.SetStateAction<any[]>>;
  incomingRequests: any[];
  outgoingRequests: any[];
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuth } = useAuth();
  const [friends, setFriends] = useState<string[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [activeGames, setActiveGames] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuth) return;
    fetchFriends(
      token!,
      setFriends,
      setIncomingRequests,
      setOutgoingRequests,
    ).catch((err) => {
      console.log(err);
    });
  }, [token, isAuth]);

  return (
    <StoreContext.Provider
      value={{ friends, fetchFriends, activeGames, setActiveGames, incomingRequests, outgoingRequests }}
    >
      {children}
    </StoreContext.Provider>
  );
};

const fetchFriends = async (
  token: string,
  setFriends: Function,
  setIncomingRequests: Function,
  setOutgoingRequests: Function,
) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/friends`, {
    headers: { Authorization: token },
  });
  if (!response.ok) {
    if (response.status === 401) {
      console.log("Unauthorized");
    } else {
      console.log("Something went wrong.");
    }
  } else {
    const data = await response.json();

    const { friends, incomingRequests, outgoingRequests } = data;

    // console.log(data, friends, incomingRequests, outgoingRequests);

    setFriends(friends);
    setIncomingRequests(incomingRequests);
    setOutgoingRequests(outgoingRequests);
  }
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
