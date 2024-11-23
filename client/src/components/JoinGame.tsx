import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import verifyToken from "../utils/verifyToken";
import { Socket } from "socket.io-client";
import { MdCancel } from "react-icons/md";

interface JoinGameProps {
  socket: Socket;
}

const JoinGame: React.FC<JoinGameProps> = ({ socket }) => {
  const navigate = useNavigate();
  const [searching, setSearching] = useState<boolean>();
  const [gameType, setGameType] = useState<string>("");

  useEffect(() => {
    const matchFoundListener = (gameId: string) => {
      console.log("matchFound!!!");
      navigate(`/${gameId}`);
      setSearching(false);
    };

    socket.on("matchFound", matchFoundListener);
    return () => {
      socket.off("matchFound", matchFoundListener);
    };
  }, [socket]);

  const searchMatch = async (gameType: string) => {
    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    try {
      setGameType(gameType);
      // socket.emit("searchMatch", gameType, (error: any) => {
      //   if (error) {
      //     console.error("Failed to emit searchMatch:", error);
      //     return;
      //   }
      //   setSearching(true);
      // });
      socket.emit("searchMatch", gameType);
      setSearching(true);

      // const matchFoundListener = (gameId: string) => {
      //   console.log("matchFound!!!");
      //   navigate(`/${gameId}`);
      //   setSearching(false);
      // };

      // Remove any existing listener to avoid duplicates
      // socket.on("matchFound", matchFoundListener);
      // socket.off("matchFound", matchFoundListener);
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };
  const friendlyGame = async (gameType: string) => {
    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    try {
      socket.emit("createFriendlyGame", gameType);
      setSearching(true);
      socket.on("friendlyGameCreated", (gameId) => {
        navigate(`/${gameId}`);
        // location.reload();
        setSearching(false);
      });
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const cancelSearch = async () => {
    socket.emit("cancelSearch", gameType);
    socket.on("searchCancelled", () => {
      setSearching(false);
    });
  };

  return (
    <div>
      {searching ? (
        <div>
          <div>Searching...</div>
          <button onClick={cancelSearch}>
            {" "}
            <MdCancel />
          </button>
        </div>
      ) : (
        <div className="flex flex-col mt-32 gap-8 items-center">
          <div className="flex gap-4 flex-wrap mx-12 justify-center">
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("5")}
            >
              5 Minutes
            </button>
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("10")}
            >
              10 Minutes
            </button>
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("15")}
            >
              15 Minutes
            </button>
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-red-700 flex items-center text-red-700 justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("0")}
            >
              Instant
            </button>
          </div>
          <div>
            <button
              className="border border-gray-400 flex items-center text-gray-400 justify-center p-2 font-semibold rounded-sm"
              onClick={() => friendlyGame("10")}
            >
              Play with a friend
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGame;
