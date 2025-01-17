import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import verifyToken from "../utils/verifyToken";
import { MdCancel } from "react-icons/md";
import { useSocket } from "../context/SocketContext";
import {useAuth} from "../context/AuthContext";
import Button from "./Button";

const JoinGame = () => {
  const navigate = useNavigate();
  const [searching, setSearching] = useState<boolean>();
  const { socket } = useSocket();
  const {isAuth} = useAuth()
  const [isRated, setIsRated] = useState<boolean>(isAuth);

  useEffect(() => {
    setIsRated(isAuth);
  }, [isAuth]);

  const switchRanked = () => {
    setIsRated(!isRated);
  }

  useEffect(() => {
    if (!socket) return;

    const matchFoundListener = (
      gameId: string,
      callback: (ack: string) => void,
    ) => {
      callback("ACK");
      navigate(`/${gameId}`);
      setSearching(false);
    };

    socket.on("matchFound", matchFoundListener);
    return () => {
      socket.off("matchFound", matchFoundListener);
    };
  }, [socket]);

  const searchMatch = async (gameType: string, isRanked:boolean = true) => {
    if (!socket) return;

    const isAuth = await verifyToken();
    if (!isAuth) {
      console.error("Token verification failed");
      return;
    }
    try {
      socket.emit("searchMatch", gameType, isRanked);
      socket.on("searchStarted", () => setSearching(true));
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
      socket.on(
        "friendlyGameCreated",
        (gameId, callback: (ack: string) => void) => {
          callback("ACK");
          navigate(`/${gameId}`);
          // location.reload();
          setSearching(false);
        },
      );
    } catch (e) {
      console.error("Failed to join the game:", e);
    }
  };

  const cancelSearch = async () => {
    if (!socket) return;

    socket.emit("cancelSearch");
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
        <div className="flex flex-col mt-20 sm:mt-32 gap-8 items-center">
          {isAuth &&
            <Button
              className={`${isRated ? "bg-color-green-1" : "bg-color-red-1"} p-2`}
              onClick={switchRanked}
              disabled={!isAuth}
              text={isRated ? "Rated" : "Unrated"}
            />
          }
          <div className="flex gap-2 flex-wrap mx-12 justify-center">
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("5", isRated)}
            >
              5 Minutes
            </button>
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("10", isRated)}
            >
              10 Minutes
            </button>
            <button
              className="border h-24 w-32 text-xl bg-gray-800/40 border-white flex items-center justify-center p-2 font-semibold rounded-md"
              onClick={() => searchMatch("15", isRated)}
            >
              15 Minutes
            </button>
            {/*<button*/}
            {/*  className="border h-24 w-32 text-xl bg-gray-800/40 border-red-700 flex items-center text-red-700 justify-center p-2 font-semibold rounded-md"*/}
            {/*  onClick={() => searchMatch("0")}*/}
            {/*>*/}
            {/*  Instant*/}
            {/*</button>*/}
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
