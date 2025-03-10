import React from "react";

const calculateWinRate = (wins: number, losses: number, draws: number) => {
  const totalGames = wins + losses + draws;
  if (totalGames === 0) {
    return 0;
  }
  return (wins / totalGames) * 100;
};

interface ProfileStatsProps {
  userData: any;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userData }) => {
  return (
    <>
      {(["bullet", "blitz", "rapid", "standard"] as const).map((gameType) => (
        <div
          className="bg-color-neutral-850 w-72  h-32 rounded-md overflow-hidden border-2 border-color-accent-300"
          key={gameType}
        >
          <h1 className="bg-color-neutral-700 text-[20px] font-normal capitalize py-0.5">
            {gameType}
          </h1>
          <div className="flex justify-between mx-8 mt-[18px] items-center">
            <div className=" flex flex-col justify-center items-center max-w-12 text-nowrap">
              <div className="text-[16px] text-color-neutral-300">Games</div>
              <div className="text-[22px] font-normal">
                {userData.perfs[gameType].allR}
              </div>
            </div>
            <div className="-mt-1 flex flex-col justify-center items-center max-w-12 text-nowrap">
              <div className="text-[18px] text-color-neutral-300 mb-1">
                Rating
              </div>
              <div className="text-[28px] font-normal">
                {userData.perfs[gameType].elo.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className=" flex flex-col justify-center items-center max-w-12 text-nowrap">
              <div className="text-[16px] text-color-neutral-300">Win Rate</div>
              <div className="text-[22px] font-normal">
                {calculateWinRate(
                  userData.perfs[gameType].winsR,
                  userData.perfs[gameType].lossesR,
                  userData.perfs[gameType].drawsR,
                ).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                %
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProfileStats;
