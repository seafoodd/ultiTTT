import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";
import { GrStatusGoodSmall } from "react-icons/gr";
import { MdLocationOn } from "react-icons/md";
import {FaBirthdayCake, FaUserMinus, FaUserPlus} from "react-icons/fa";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ChallengeModal from "../components/ChallengeModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useStore } from "../context/StoreContext";
import LoadingCircle from "../components/LoadingCircle";
import {IoClose} from "react-icons/io5";
import {IoMdCheckmark} from "react-icons/io";
import {RiSwordLine} from "react-icons/ri";

interface UserData {
  username: string;
  location: string;
  dateOfBirth: Date;
  avatarUrl: string;
  elo: number;
}

const fetchUserData = async (
  username: string,
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${username}`,
    );
    if (!response.ok) {
      if (response.status === 404) {
        setError("The player doesn't exist");
      } else {
        setError("Something went wrong");
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

const getFriendButton = (
  friends: string[],
  username: string,
  isAuth: boolean,
  outgoingRequests: { username: string; id: string }[],
  incomingRequests: { username: string; id: string }[],
  friendsLoading: boolean,
  sendFriendRequest: Function
) => {
  let disabled = false;
  let text = "Add friend";
  let action: "add" | "remove" = "add";
  let color: "bg-color-information-500" | "bg-color-neutral-700" | "bg-color-danger-600" = "bg-color-neutral-700"
  let icon = <FaUserPlus size={20}/>;

  console.log(username, outgoingRequests)

  if (!isAuth) {
    disabled = true;
  } else if (friends.includes(username)) {
    text = "Remove friend";
    color = "bg-color-danger-600"
    action = "remove";
    icon = <FaUserMinus size={20} className='-mb-0.5'/>;
  } else if (outgoingRequests.some((r) => r.username === username)) {
    text = "Cancel request";
    icon = <IoClose size={26} className='-mb-0.5 -mx-1'/>;
    color = "bg-color-danger-600"
  } else if (incomingRequests.some((r) => r.username === username)) {
    icon = <IoMdCheckmark size={26} className='-mb-0.5 -mx-1'/>;
    text = "Accept request";
    color = "bg-color-information-500"
  }

  return (
    <Button
      text={text}
      icon={icon}
      onClick={() => sendFriendRequest(username, action)}
      className={`${color} px-4 py-3 disabled:bg-color-gray-3`}
      disabled={disabled}
      loading={friendsLoading}
    />
  );
};

const Profile = () => {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading: friendsLoading,
    sendFriendRequest,
  } = useStore();
  const { socket } = useSocket();
  const { isAuth } = useAuth();
  const { username } = useParams<string>();
  const [userData, setUserData] = useState<UserData | null>(null);
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

    fetchUserData(username!, setUserData, setError, setLoading).catch((err) => {
      console.log(err);
    });

    socket.emit("isUserOnline", username, (online: boolean) => {
      setIsOnline(online);
    });
  }, [username, socket]);

  if (loading) {
    return <LoadingCircle />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const dateOfBirthFormatted = new Date(
    userData!.dateOfBirth,
  ).toLocaleDateString();

  return (
    <div className="flex flex-col w-full items-center">
      <div className="text-xl max-w-[768px] w-full flex flex-col justify-center items-center gap-4 mt-12">
        <div className="flex justify-start w-full px-8 md:px-12">
          <div className="flex items-center justify-center gap-1 mr-auto">
            <GrStatusGoodSmall
              className={`mt-1.5 ${isOnline ? "text-color-green-1" : "stroke-color-gray-4 stroke-2 p-0.5 fill-transparent"}`}
            />
            <p className="font-semibold truncate max-w-40">
              {userData!.username}
            </p>
          </div>
          <p className="font-medium">Elo: {userData!.elo}</p>
        </div>
        <div className="text-[18px] px-8 md:px-12 text-white/95 flex justify-start w-full flex-col items-start">
          {userData!.location && (
            <p className="flex items-center justify-start">
              <MdLocationOn className="mr-2"/>
              {userData!.location}
            </p>
          )}
          {userData!.dateOfBirth && (
            <p className="flex items-center justify-start">
              <FaBirthdayCake className="mr-2"/>
              {dateOfBirthFormatted}
            </p>
          )}
        </div>
        <div className={`px-8 md:px-12 py-8 w-full`}>
          {isOwner ? (
            ""
          ) : (
            <div className="flex gap-4 justify-start w-full">
              <Button
                icon={<RiSwordLine size={20} className='-mb-0.5'/>}
                text="Challenge"
                onClick={() => setIsChallengeModalOpen(isOnline && !isOwner)}
                className={`bg-color-accent-400 disabled:bg-color-gray-3 px-4 py-3`}
                disabled={!isOnline || !isAuth}
              />
              <Modal
                isOpen={isChallengeModalOpen}
                setIsOpen={setIsChallengeModalOpen}
              >
                <ChallengeModal username={userData!.username}/>
              </Modal>
              {username ? (
                getFriendButton(
                  friends,
                  username,
                  isAuth,
                  outgoingRequests,
                  incomingRequests,
                  friendsLoading,
                  sendFriendRequest
                )
              ) : (
                <LoadingCircle/>
              )}
              {/*<Button text="Challenge" onClick={() => console.log("challenged")} className='bg-color-blue-2 px-4 py-3'/>*/}
            </div>
          )}
        </div>
      </div>
      <div className="border-t md:border-none max-w-[768px] border-white/50 w-full">
        <GameHistory username={username!}/>
      </div>
    </div>
  );
};

export default Profile;