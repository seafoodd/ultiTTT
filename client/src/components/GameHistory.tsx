import React, { useCallback, useEffect, useRef, useState } from "react";
import BoardPreview from "./BoardPreview";
import Button from "../shared/ui/Button";
import { AiFillPlayCircle } from "react-icons/ai";
import { RiSwordLine } from "react-icons/ri";
import { formatDate, gameDuration } from "@/shared/lib/client/formatUtils";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import useNotification from "../shared/hooks/use-notification";
import { APP_ROUTES } from "@/shared/constants/app-routes";

const resultMessages = {
  win: <div className="text-color-information-500 w-full">Victory</div>,
  loss: <div className="text-color-danger-600 w-full">Defeat</div>,
  tie: <div className="text-color-gray-3 w-full">Draw</div>,
  aborted: <div className="text-color-gray-3 w-full">Aborted</div>,
};

const gameTime = {
  bullet: "2+1",
  blitz: "5+3",
  rapid: "10+5",
  standard: "15+10",
};

interface Game {
  moveHistory: any[];
  gameType: "bullet" | "blitz" | "rapid" | "standard";
  isRated: boolean;
  gameResult: string;
  id: string;
  players: any;
  createdAt: Date;
  duration: number;
  board: any;
}

const GameHistory: React.FC<{ username: string }> = ({ username }) => {
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const { showError } = useNotification();

  const fetchGameHistory = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/users/${username}/games?page=${page}&limit=${10}`
      );
      if (!response.ok) {
        showError(
          response.status === 429 ? "Too many requests" : "Something went wrong"
        );
        console.error("Failed to fetch game history", response);
        setGameHistory(gameHistory);
        return;
      }
      const data = await response.json();

      console.log("data", data);
      const games = data.games;

      setGameHistory((prevGames: any[]) =>
        page > 1 ? [...prevGames, ...games] : games
      );
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  useEffect(() => {
    setGameHistory([]);
    setPage(1);
  }, [username]);

  useEffect(() => {
    fetchGameHistory().catch((e) => {
      console.log("Error fetching game history", e);
    });
  }, [page, username]);

  const lastGameElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  return (
    <div className="flex items-center flex-col w-full">
      {gameHistory &&
        gameHistory.map((game: Game, index) => (
          <div
            key={index}
            ref={index === gameHistory.length - 1 ? lastGameElementRef : null}
            className="flex flex-col gap-y-6 justify-center md:flex-row bg-color-neutral-850 border-b-[3px] border-color-neutral-900 mb-4 py-2 sm:px-2 w-full sm:rounded-md items-center"
          >
            <div className="flex-none flex gap-x-2 md:gap-x-0 ml-3 sm:ml-0">
              <BoardPreview board={game.board} size={170} />
              <div className="flex flex-col pt-3 px-4 lg:px-6">
                <div className="font-normal flex justify-center my-2 text-[30px] text-start text-nowrap">
                  {resultMessages[
                    game.gameResult as keyof typeof resultMessages
                  ] || resultMessages.tie}
                </div>
                <div className="text-color-neutral-300 font-normal mb-8 text-nowrap w-40 text-start">
                  {gameTime[game.gameType]} •{" "}
                  {game.gameType.charAt(0).toUpperCase() +
                    game.gameType.slice(1)}{" "}
                  • {game.isRated ? "Rated" : "Unrated"}
                </div>
                <Button
                  asChild
                  className="py-2.5 bg-color-information-500 max-w-32 hover:bg-color-information-600"
                >
                  <Link to={APP_ROUTES.Game(game.id)}>
                    <AiFillPlayCircle size={22} className="mt-[1px]" />
                    Replay
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex-shrink md:h-[133px] w-full flex flex-col items-center md:justify-between md:flex-row md:items-end">
              <div className="flex flex-col gap-y-6 md:gap-y-0 md:flex-col-reverse lg:flex-row w-full h-full items-center lg:items-end md:mx-4 sm:px-16 md:px-4 lg:px-0 lg:mx-0">
                <div className="bg-color-neutral-875 w-full lg:px-4 flex-shrink h-28 shadow-color-neutral-885 sm:rounded-sm shadow-md lg:mx-12 flex justify-center items-center">
                  <div className="flex flex-col justify-center items-center w-full">
                    <div className="flex font-normal text-[24px] justify-center items-center gap-12">
                      <div className="text-end w-16">
                        {game.players[0].playerElo.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-start w-16">
                        {game.players[1].playerElo.toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                    <div className="flex font-normal w-full text-[24px] justify-center items-center gap-4">
                      <Link
                        to={`/@/${game.players[0].userId}`}
                        className="text-color-information-500 w-full max-w-[180px] text-end truncate hover:underline"
                      >
                        {game.players[0].userId}
                      </Link>
                      <div>
                        <RiSwordLine
                          size={40}
                          className="text-color-neutral-300"
                        />
                      </div>
                      <Link
                        to={`/@/${game.players[1].userId}`}
                        className="text-color-danger-500 w-full max-w-[180px] text-start truncate hover:underline"
                      >
                        {game.players[1].userId}
                      </Link>
                    </div>
                    {game.players[0].playerEloChange !== 0 && (
                      <div className="flex font-normal text-[16px] justify-center items-center gap-8">
                        <div
                          className={`${
                            game.players[0].playerEloChange >= 0
                              ? "text-color-success-400"
                              : "text-color-danger-500"
                          } text-end`}
                        >
                          {game.players[0].playerEloChange > 0 && "+"}
                          {game.players[0].playerEloChange}
                        </div>
                        <div
                          className={`${
                            game.players[1].playerEloChange >= 0
                              ? "text-color-success-400"
                              : "text-color-danger-500"
                          } text-end`}
                        >
                          {game.players[1].playerEloChange > 0 && "+"}
                          {game.players[1].playerEloChange}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex lg:flex-col w-fit md:justify-center gap-x-32 lg:justify-between lg:h-full lg:pt-6 pb-2 lg:pb-0 text-[20px] font-normal text-color-neutral-300 text-end items-end text-nowrap">
                  <div className="flex lg:flex-row-reverse gap-2 items-center">
                    <FaCalendarAlt />
                    {formatDate(game.createdAt)}
                  </div>
                  <div className="flex lg:flex-row-reverse gap-2 items-center">
                    <FaClock />
                    {gameDuration(game.duration)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default GameHistory;
