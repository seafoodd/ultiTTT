import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";
import { GrStatusGoodSmall } from "react-icons/gr";
import { MdLocationOn } from "react-icons/md";
import { FaBirthdayCake } from "react-icons/fa";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ChallengeModal from "../components/ChallengeModal";
import { useAuth } from "../context/AuthContext";
import {useSocket} from "../context/SocketContext";

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

const Profile = () => {
  const {socket} = useSocket();

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
  const [isChallengeModalOpen, setIsChallengeModalOpen] =
    useState<boolean>(false);
  const { currentUser } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    setIsOwner(username === currentUser?.username);
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;

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
  }, [username, socket]);

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
    <div className="flex flex-col w-full items-center">
      <div className="text-xl max-w-[768px] w-full flex flex-col justify-center items-center gap-4 mt-8">
        <div className="flex justify-start w-full px-8 md:px-12">
          <div className="flex items-center justify-center gap-1 mr-auto">
            <GrStatusGoodSmall
              className={`mt-1.5 ${isOnline ? "text-color-green-1" : "stroke-color-gray-4 stroke-2 p-0.5 fill-transparent"}`}
            />
            <p className="font-semibold truncate max-w-40">{userData!.username}</p>
          </div>
          <p className="font-medium">Elo: {userData!.elo}</p>
        </div>
        <div className="text-[18px] px-8 md:px-12 text-white/95 flex justify-start w-full flex-col items-start">
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
        <div className={`px-8 md:px-12 py-8 w-full`}>
          {isOwner ? "":
          <div className='flex gap-4 justify-start w-full'>
            <Button
              text="Challenge"
              onClick={() => setIsChallengeModalOpen(isOnline && !isOwner)}
              className={`bg-color-blue-2 disabled:bg-color-gray-3 px-4 py-3`}
              disabled={!isOnline}
            />
            <Modal
              isOpen={isChallengeModalOpen}
              setIsOpen={setIsChallengeModalOpen}
            >
              <ChallengeModal username={userData!.username} />
            </Modal>
            <Button
              text="Add friend"
              onClick={() => console.log("added friend")}
              className="bg-color-blue-2 px-4 py-3 disabled:bg-color-gray-3"
              // TODO: implement friends
              disabled={true}
            />
            {/*<Button text="Challenge" onClick={() => console.log("challenged")} className='bg-color-blue-2 px-4 py-3'/>*/}
          </div>
          }
        </div>
      </div>
      <div className="border-t md:border-none max-w-[768px] border-white/50 w-full">
        <GameHistory username={username!} />
      </div>
    </div>
  );
};

export default Profile;
