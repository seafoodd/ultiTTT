import React, { useEffect, useState } from "react";
import BoardPreview from "./BoardPreview";

const resultMessages = {
  win: <div className="text-green-500">Victory!</div>,
  loss: <div className="text-red-500">Defeat!</div>,
  tie: <div className="text-yellow-800">Tie!</div>,
};

const fetchGameHistory = async (username: string, setGameHistory: Function) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/username/${username}/games`,
    );
    if (!response.ok) {
      console.error("Failed to fetch game history");
    }
    const data = await response.json();

    const gamesWithPlayers = await Promise.all(
      data.map(async (game: any) => {
        let player1Response = null;
        let player2Response = null;

        if (game.player1Id) {
          player1Response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/id/${game.player1Id}`,
          );
        }
        if (game.player2Id) {
          player2Response = await fetch(
            `${import.meta.env.VITE_API_URL}/users/id/${game.player2Id}`,
          );
        }
        let player1 = null;
        let player2 = null;
        if (player1Response) player1 = await player1Response.json();
        if (player2Response) player2 = await player2Response.json();
        return { ...game, player1, player2 };
      }),
    );

    setGameHistory(gamesWithPlayers);
  } catch (error) {
    console.error("Error fetching game history:", error);
  }
};

const GameHistory: React.FC<{ username: string }> = ({ username }) => {
  const [gameHistory, setGameHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchGameHistory(username, setGameHistory);
  }, [username]);

  return (
    <div className="flex items-center flex-col w-full">
      {gameHistory.map((game, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-32 border border-white/20 p-4 w-full max-w-[720px]"
        >
          <div className="flex-none">
            <BoardPreview board={game.board} />
          </div>
          <div className="flex-shrink flex flex-col w-full md:justify-between md:flex-row items-center">
            <div className="flex gap-6 sm:gap-2 items-center">
              <PlayerInfo
                player={game.player1}
                elo={game.player1Elo}
                eloChange={game.player1EloChange}
              />
              <span>vs</span>
              <PlayerInfo
                player={game.player2}
                elo={game.player2Elo}
                eloChange={game.player2EloChange}
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

const PlayerInfo: React.FC<{ player: any; elo: number; eloChange: number }> = ({
  player,
  elo,
  eloChange,
}) => (
  <div className="flex flex-col justify-center items-center">
    <div className={`text-xl font-bold ${player ? "" : "text-white/70"}`}>
      {player ? player.username : "deleted"}
    </div>
    <div className="text-gray-400 font-normal text-md">
      ({elo}{" "}
      <span className={eloChange >= 0 ? "text-green-700" : "text-red-700"}>
        {eloChange > 0 && "+"}
        {eloChange}
      </span>
      )
    </div>
  </div>
);

export default GameHistory;