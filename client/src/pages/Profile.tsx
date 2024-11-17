import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";
import { Socket } from "socket.io-client";
import { GrStatusGoodSmall } from "react-icons/gr";
import { MdLocationOn } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";

interface ProfileProps {
  socket: Socket;
}

const fetchUserData = async (
  username: string,
  setUserData: Function,
  setError: Function,
  setLoading: Function,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/username/${username}`,
    );
    if (!response.ok) {
      if (response.status === 404) {
        setError("The player doesn't exist");
      } else {
        setError("Something went wrong.");
      }
    } else {
      const data = await response.json();
      setUserData(data);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};

const Profile: React.FC<ProfileProps> = ({ socket }) => {
  const { username } = useParams<string>();
  const [userData, setUserData] = useState<{
    username: string;
    location: string;
    dateOfBirth: Date;
    avatarUrl: string;
    elo: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    fetchUserData(username!, setUserData, setError, setLoading);

    socket.emit("isUserOnline", username, (online: boolean) => {
      setIsOnline(online);
    });

    socket.on("userOnline", (onlineUsername) => {
      if (onlineUsername === username) {
        console.log(`${username} is now online`);
        setIsOnline(true);
      }
    });

    socket.on("userOffline", (offlineUsername) => {
      if (offlineUsername === username) {
        console.log(`${username} is now offline`);
        setIsOnline(false);
      }
    });

    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const dateOfBirthFormatted = new Date(
    userData!.dateOfBirth,
  ).toLocaleDateString();

  return (
    <div className="flex flex-col w-full">
      <div className="text-xl mx-auto flex flex-col justify-center items-center gap-4 mt-8">
        <div className="flex justify-start gap-24 sm:gap-32 md:gap-48 lg:gap-72 w-full">
          <div className="flex items-center justify-center gap-1 mr-auto">
            <GrStatusGoodSmall
              className={`mt-1.5 ${isOnline ? "text-color-green-1" : "stroke-color-gray-4 stroke-2 p-0.5 fill-transparent"}`}
            />
            <p className="font-semibold">{userData!.username}</p>
          </div>

          <p className="font-medium">Elo: {userData!.elo}</p>
        </div>
        <div className="text-[18px] text-white/95 flex justify-start w-full flex-col items-start">
          {userData!.location && (
            <p className="flex items-center justify-start">
              <MdLocationOn className="fill-color-gray-4" />{" "}
              {userData!.location}
            </p>
          )}
          {userData!.dateOfBirth && (
            <p className="flex items-center justify-start">
              <FaBirthdayCake className="fill-color-gray-4" />{" "}
              {dateOfBirthFormatted}
            </p>
          )}
        </div>
      </div>
      <div className="mt-24 w-full">
        <GameHistory username={username!} />
      </div>
    </div>
  );
};

export default Profile;
