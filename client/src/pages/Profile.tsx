import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";
import { MdCake } from "react-icons/md";
import { FaEdit, FaUserMinus, FaUserPlus } from "react-icons/fa";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ChallengeModal from "../components/ChallengeModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useStore } from "../context/StoreContext";
import LoadingCircle from "../components/LoadingCircle";
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { RiSwordLine } from "react-icons/ri";
import { HiStatusOnline } from "react-icons/hi";
import { AiFillHeart, AiOutlineTwitch } from "react-icons/ai";

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
  sendFriendRequest: Function,
) => {
  let disabled = false;
  let text = "Add friend";
  let action: "add" | "remove" = "add";
  let color:
    | "bg-color-information-500"
    | "bg-color-neutral-700"
    | "bg-color-danger-600" = "bg-color-neutral-700";
  let icon = <FaUserPlus size={20} />;

  console.log(username, outgoingRequests);

  if (!isAuth) {
    disabled = true;
  } else if (friends.includes(username)) {
    text = "Remove friend";
    color = "bg-color-neutral-700";
    action = "remove";
    icon = <FaUserMinus size={20} className="-mb-0.5" />;
  } else if (outgoingRequests.some((r) => r.username === username)) {
    text = "Cancel request";
    icon = <IoClose size={26} className="-mb-0.5 -mx-1" />;
    color = "bg-color-danger-600";
  } else if (incomingRequests.some((r) => r.username === username)) {
    icon = <IoMdCheckmark size={26} className="-mb-0.5 -mx-1" />;
    text = "Accept request";
    color = "bg-color-information-500";
  }

  return (
    <Button
      text={text}
      icon={icon}
      onClick={() => sendFriendRequest(username, action)}
      className={`${color} px-6 py-2 disabled:bg-color-neutral-600 disabled:text-color-neutral-200`}
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
      console.log("online");
      setIsOnline(online);
    });
  }, [username, socket]);

  if (loading) {
    return <LoadingCircle />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex w-full flex-row justify-center gap-6 max-w-[1440px]">
      <div className="max-w-[1073px] w-full">
        <div className="bg-color-neutral-800 mb-6 w-full sm:rounded-md">
          <div className="sm:pt-3 h-full lg:px-9 flex flex-col lg:flex-row justify-between">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row px-2 lg:pr-8 justify-center lg:justify-start gap-1 sm:gap-8 min-h-28 w-full">
                <div className="sm:bg-color-neutral-850 sm:rounded-md p-1.5 sm:p-3 lg:min-w-56">
                  <div className="text-2xl font-medium text-start">
                    {userData!.username}
                  </div>
                  <div className="text-color-neutral-300 text-start text-[13px] sm:text-[15px] sm:text-wrap sm:line-clamp-3 truncate max-w-[90%] sm:max-w-80 max-h-24">
                    🙂👍hello everyone this is my pprofiel 88 888888888888 88888
                    888888888 8888888888 888888hgfffffffffffffffffffffffffff
                  </div>
                </div>
                <div className="sm:bg-color-neutral-850 sm:rounded-md justify-center items-center my-2 sm:my-0 flex lg:mx-auto sm:px-9 gap-4 lg:gap-8 text-[14px] min-w-fit sm:text-[16px]">
                  <div className="flex flex-col items-center justify-end h-16 lg:h-24 font-normal text-color-neutral-200">
                    <HiStatusOnline
                      className={`${isOnline ? "text-color-green-1" : ""} w-9 h-9 sm:w-11 sm:h-11`}
                    />
                    {isOnline ? (
                      <div className="flex gap-x-1 lg:flex-col">
                        <div>Online</div>
                        <div>Now</div>
                      </div>
                    ) : (
                      <>
                        <div className="hidden lg:flex">Last online</div>
                        <div>6 days ago</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-end h-16 lg:h-24 font-normal text-color-neutral-200">
                    <MdCake className="w-10 h-10 sm:w-12 sm:h-12" />
                    <div className="hidden lg:flex">Member since</div>
                    <div>Apr 17, 2025</div>
                  </div>
                  <div className="flex flex-col items-center justify-end h-16 lg:h-24 font-normal text-color-neutral-200">
                    <AiFillHeart className="w-9 h-9 sm:w-11 sm:h-11" />
                    <div className="hidden lg:flex">Supporter for</div>
                    <div>3 months</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start lg:ml-8 items-center my-6 gap-4 flex-wrap mx-2">
                {isOwner ? (
                  <>
                    <Button
                      icon={<FaEdit size={18} />}
                      text="Edit"
                      href="/settings"
                      className="bg-color-neutral-700 px-6 py-2"
                    />
                  </>
                ) : (
                  <>
                    <Button
                      icon={<RiSwordLine size={20} className="-mb-0.5" />}
                      title={!isOnline ? "User is offline" : undefined}
                      text="Challenge"
                      onClick={() =>
                        setIsChallengeModalOpen(isOnline && !isOwner)
                      }
                      className={`bg-color-accent-400 disabled:bg-color-neutral-600 text-color-neutral-100 disabled:text-color-neutral-200 px-6 py-2`}
                      disabled={!isOnline || !isAuth}
                    />
                    <Modal
                      isOpen={isChallengeModalOpen}
                      setIsOpen={setIsChallengeModalOpen}
                    >
                      <ChallengeModal username={userData!.username} />
                    </Modal>
                    {username ? (
                      getFriendButton(
                        friends,
                        username,
                        isAuth,
                        outgoingRequests,
                        incomingRequests,
                        friendsLoading,
                        sendFriendRequest,
                      )
                    ) : (
                      <LoadingCircle />
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="bg-color-neutral-850 lg:rounded-md flex lg:flex-col p-1 lg:p-3 min-w-40 lg:mb-6 flex-wrap justify-center gap-x-8 gap-y-1 px-8">
              <div className="hidden lg:flex justify-start font-medium text-[20px] mb-2">
                Links
              </div>
              <a
                href="#"
                className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
              >
                <AiOutlineTwitch size={20} className="text-color-accent-400" />
                Twitch
              </a>
              <a
                href="#"
                className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
              >
                <AiOutlineTwitch size={20} className="text-color-accent-400" />
                Youtube
              </a>
              <a
                href="#"
                className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
              >
                <AiOutlineTwitch size={20} className="text-color-accent-400" />
                Discord
              </a>
              <a
                href="#"
                className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
              >
                <AiOutlineTwitch size={20} className="text-color-accent-400" />
                Reddit
              </a>
              <a
                href="#"
                className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
              >
                <AiOutlineTwitch size={20} className="text-color-accent-400" />
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="flex xl:hidden bg-color-neutral-800 w-full h-[200px] mb-6 sm:rounded-md">
          Stats
        </div>

        <div className="bg-color-neutral-800 max-w-[1073px] w-full sm:rounded-md overflow-hidden p-8">
          <GameHistory username={username!} />
        </div>
      </div>
      <div className="hidden xl:flex bg-color-neutral-800 max-w-[344px] w-full h-[700px] rounded-md">
        Stats
      </div>
    </div>
  );
};

export default Profile;
