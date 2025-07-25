import React from "react";
import CopyField from "./CopyField";
import Button from "../shared/ui/Button";
import { BiHome } from "react-icons/bi";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/shared/constants/app-routes";
import { Env } from "@/shared/constants/env";

interface WaitingLobbyProps {
  invitedUsername: string;
  isDeclined: boolean;
  gameId: string;
}

const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  invitedUsername,
  isDeclined,
  gameId,
}) => {
  const env = Env.VITE_ENV || "production";

  return isDeclined ? (
    <div className="mt-12 flex flex-col justify-center items-center">
      <h1 className="font-semibold text-xl">
        {invitedUsername ? (
          <span className="max-w-40 truncate">{invitedUsername}</span>
        ) : (
          "opponent"
        )}{" "}
        declined the challenge
      </h1>
      <Button asChild className="bg-color-blue-2 px-2 py-2 mt-2">
        <Link to={APP_ROUTES.Home}>
          <BiHome />
          Home
        </Link>
      </Button>
    </div>
  ) : (
    <div>
      <h1 className="flex">
        {invitedUsername ? (
          <div>
            Waiting for
            <span className="max-w-40 truncate font-semibold mx-1">
              {invitedUsername}
            </span>
            to join...
          </div>
        ) : (
          <div className="mt-12 px-4">
            <div className="font-semibold text-lg sm:text-xl mx-1 mb-4">
              To invite someone to play, send this link:
            </div>
            <CopyField
              text={`${
                env === "production"
                  ? "https://ultittt.org"
                  : "http://localhost:5173"
              }/${gameId}`}
            />
          </div>
        )}
      </h1>
    </div>
  );
};

export default WaitingLobby;
