import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import verifyToken from "../utils/verifyToken";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import GameTypeButton from "./GameTypeButton";
import { BiRightArrowAlt } from "react-icons/bi";
import { playSound } from "../utils/soundUtils";

const JoinGame = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { isAuth } = useAuth();
  const [isRated, setIsRated] = useState<boolean>(isAuth);
  const gameCodeRef = useRef<HTMLInputElement>(null);
  const [currentSearching, setCurrentSearching] = useState<string>();
  const [notificationSound] = useState(
    () => new Audio("/sounds/GameFound.mp3"),
  );

  const handleJoinWithCode = () => {
    if (gameCodeRef.current) {
      window.location.href = `/${gameCodeRef.current.value}`;
    }
  };

  useEffect(() => {
    setIsRated(isAuth);
  }, [isAuth]);

  useEffect(() => {
    cancelSearch().catch((e) => {
      console.error("Error canceling search:", e);
    });
  }, [isRated]);

  useEffect(() => {
    if (!socket) return;

    const matchFoundListener = (
      gameId: string,
      callback: (ack: string) => void,
    ) => {
      playSound(notificationSound);
      callback("ACK");
      navigate(`/${gameId}`);
    };

    socket.on("matchFound", matchFoundListener);
    return () => {
      socket.off("matchFound", matchFoundListener);
    };
  }, [socket]);

  const searchMatch = async (gameType: string, isRanked: boolean = true) => {
    if (!socket) return;

    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    if (currentSearching) return cancelSearch();

    try {
      socket.emit("searchMatch", gameType, isRanked);

      socket.off("searchStarted");

      socket.on("searchStarted", () => {
        console.log("search", gameType);
        setCurrentSearching(gameType);
      });
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const friendlyGame = async (gameType: string) => {
    if (!socket) return;

    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }

    try {
      socket.emit("createFriendlyGame", gameType);

      socket.off("friendlyGameCreated");

      socket.on(
        "friendlyGameCreated",
        (gameId, callback: (ack: string) => void) => {
          callback("ACK");
          cancelSearch();
          window.location.href = `/${gameId}`;
        },
      );
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const cancelSearch = async () => {
    if (!socket) return;

    socket.emit("cancelSearch");
    socket.off("searchCancelled");
    socket.on("searchCancelled", () => {
      setCurrentSearching("");
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:mt-6 items-center w-full">
        <div className="w-full px-2 sm:px-0 max-w-[420px] flex flex-col">
          <div className="flex justify-center items-center text-xl font-normal mb-5">
            <button
              title={isAuth ? undefined : "Log in to play rated games"}
              className={`flex-1 py-1.5 disabled:text-color-neutral-300 ${isRated ? "border-b-2 border-color-accent-300/70" : ""}`}
              onClick={() => isAuth && setIsRated(true)}
              disabled={!isAuth}
            >
              Rated
            </button>
            <button
              className={`flex-1 py-1.5 ${isRated ? "" : "border-b-2 border-color-accent-300/70"}`}
              onClick={() => setIsRated(false)}
            >
              Unrated
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <GameTypeButton
              onClick={() => searchMatch("bullet", isRated)}
              timeText="2 + 1"
              typeText="Bullet"
              isSearching={currentSearching === "bullet"}
            />
            <GameTypeButton
              onClick={() => searchMatch("blitz", isRated)}
              timeText="5 + 3"
              typeText="Blitz"
              isSearching={currentSearching === "blitz"}
            />
            <GameTypeButton
              onClick={() => searchMatch("rapid", isRated)}
              timeText="10 + 5"
              typeText="Rapid"
              isSearching={currentSearching === "rapid"}
            />
            <GameTypeButton
              onClick={() => searchMatch("standard", isRated)}
              timeText="15 + 10"
              typeText="Standard"
              isSearching={currentSearching === "standard"}
            />
          </div>
          <button
            className="bg-color-neutral-800 hover:bg-color-neutral-600 transition-colors flex items-center text-color-accent-100 justify-center p-2 font-normal text-xl rounded-md h-12 mb-5"
            onClick={() => friendlyGame("10")}
          >
            PLAY WITH A FRIEND
          </button>
          <button
            className="bg-color-neutral-800 enabled:hover:bg-color-neutral-600 transition-colors flex items-center text-color-neutral-300 justify-center p-2 font-normal text-xl rounded-md h-12 mb-5"
            title="In development"
            disabled
          >
            PLAY WITH THE COMPUTER
          </button>
          <div className="bg-color-neutral-800 flex flex-col items-center justify-center text-color-accent-100 p-2 font-normal text-xl rounded-md h-24 mb-5">
            <p className="-mt-2.5 mb-2">JOIN WITH A CODE</p>
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                cancelSearch().catch((e) => {
                  console.error("Error canceling search:", e);
                });
                if (gameCodeRef.current) {
                  navigate(`/${gameCodeRef.current.value}`);
                }
              }}
            >
              <input
                className="bg-color-neutral-700 w-[300px] h-[38px] outline-none rounded-md px-2 pr-8"
                type="text"
                name="code"
                minLength={8}
                required
                ref={gameCodeRef}
              />
              <BiRightArrowAlt
                size={28}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-color-neutral-300 cursor-pointer"
                onClick={handleJoinWithCode}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
