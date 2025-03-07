import React, { useCallback, useEffect, useRef, useState } from "react";
import BoardPreview from "./BoardPreview";

const resultMessages = {
  win: <div className="text-color-green-1">Victory</div>,
  loss: <div className="text-color-red-1">Defeat</div>,
  tie: <div className="text-color-gray-3">Tie</div>,
  aborted: <div className="text-color-gray-3">Aborted</div>,
};

const fetchGameHistory = async (
  username: string,
  page: number,
  limit: number,
  setGameHistory: Function,
  append: boolean,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${username}/games?page=${page}&limit=${limit}`,
    );
    if (!response.ok) {
      console.error("Failed to fetch game history");
    }
    const data = await response.json();

    const gamesWithPlayers = await Promise.all(
      data.games.map(async (game: any) => {
        let playerXResponse = null;
        let playerOResponse = null;

        if (game.playerXUsername) {
          playerXResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/users/${game.playerXUsername}`,
          );
        }
        if (game.playerOUsername) {
          playerOResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/users/${game.playerOUsername}`,
          );
        }
        let playerX = null;
        let playerO = null;
        if (playerXResponse) playerX = await playerXResponse.json();
        if (playerOResponse) playerO = await playerOResponse.json();
        return { ...game, playerX, playerO };
      }),
    );

    setGameHistory((prevGames: any[]) =>
      append ? [...prevGames, ...gamesWithPlayers] : gamesWithPlayers,
    );
  } catch (error) {
    console.error("Error fetching game history:", error);
  }
};

const GameHistory: React.FC<{ username: string }> = ({ username }) => {
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    console.log("refetch");
    fetchGameHistory(username, page, 5, setGameHistory, page > 1);
  }, [username, page]);

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
    [hasMore],
  );

  return (
    <div className="flex items-center flex-col w-full">
      {gameHistory.map((game, index) => (
        <div
          key={index}
          ref={index === gameHistory.length - 1 ? lastGameElementRef : null}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-32 bg-color-neutral-850 mb-4 p-4 w-full rounded-md"
        >
          <div className="flex-none">
            <BoardPreview board={game.board} />
          </div>
          <div className="flex-shrink flex flex-col w-full md:justify-between md:flex-row items-center">
            <div className="flex gap-6 sm:gap-2 items-center">
              <PlayerInfo
                player={game.players[0]}
                elo={game.players[0].playerElo}
                eloChange={game.players[0].playerEloChange}
              />
              <span>vs</span>
              <PlayerInfo
                player={game.players[1]}
                elo={game.players[1].playerElo}
                eloChange={game.players[1].playerEloChange}
              />
            </div>
            <div className="text-xl font-medium w-24 flex items-center justify-center mt-2">
              {resultMessages[game.gameResult as keyof typeof resultMessages] ||
                resultMessages.tie}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PlayerInfo: React.FC<{
  player: any;
  elo: number;
  eloChange: number;
}> = ({ player, elo, eloChange }) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <a
        className={`text-xl font-bold ${player ? "" : "text-white/70 pointer-events-none"}
        max-w-32 truncate`}
        href={`/@/${player?.userId}`}
      >
        {player ? player.userId : "deleted"}
      </a>
      <div className="text-gray-400 font-normal text-md">
        ({elo}
        {eloChange ? (
          <span
            className={
              eloChange >= 0 ? "text-color-green-1" : "text-color-red-1"
            }
          >
            {" "}
            {eloChange > 0 && "+"}
            {eloChange}
          </span>
        ) : (
          ""
        )}
        )
      </div>
    </div>
  );
};

export default GameHistory;
