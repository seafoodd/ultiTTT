import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";
import { MdCake } from "react-icons/md";
import { FaEdit, FaUserMinus, FaUserPlus } from "react-icons/fa";
import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";
import ChallengeModal from "../components/ChallengeModal";
import { useWebSocket } from "@/shared/providers/websocket-provider";
import { useStore } from "@/shared/providers/store-provider";
import LoadingCircle from "../components/LoadingCircle";
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { RiSwordLine } from "react-icons/ri";
import { HiStatusOnline } from "react-icons/hi";
import { AiFillHeart } from "react-icons/ai";
import { formatDate, timeAgo } from "@/shared/lib/client/formatUtils";
import { FaHeartCrack } from "react-icons/fa6";
import { BiHome, BiSolidStar } from "react-icons/bi";
import ProfileStats from "../components/account/ProfileStats";
import Socials from "../components/Socials";
import { UserData } from "@/shared/lib/client/interfaces";
import { fetchUserData } from "@/shared/lib/client/dbUtils";
import { useAuth } from "@/shared/providers/auth-provider";
import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { APP_ROUTES } from "@/shared/constants/app-routes";

const getBestRating = (perfs: UserData["perfs"]) => {
  const ratings = [
    { type: "blitz", ...perfs.blitz },
    { type: "bullet", ...perfs.bullet },
    { type: "rapid", ...perfs.rapid },
    { type: "standard", ...perfs.standard },
  ];

  return ratings.reduce((best, current) =>
    current.elo > best.elo ? current : best,
  );
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
    | "bg-color-information-500 hover:bg-color-information-600"
    | "bg-color-neutral-700 hover:bg-color-neutral-600"
    | "bg-color-danger-600 hover:bg-color-danger-700" =
    "bg-color-neutral-700 hover:bg-color-neutral-600";
  let icon = <FaUserPlus size={20} />;

  if (!isAuth) {
    disabled = true;
  } else if (friends.includes(username)) {
    text = "Remove friend";
    color = "bg-color-neutral-700 hover:bg-color-neutral-600";
    action = "remove";
    icon = <FaUserMinus size={20} className="-mb-0.5" />;
  } else if (outgoingRequests.some((r) => r.username === username)) {
    text = "Cancel request";
    icon = <IoClose size={26} className="-mb-0.5 -mx-1" />;
    color = "bg-color-danger-600 hover:bg-color-danger-700";
  } else if (incomingRequests.some((r) => r.username === username)) {
    icon = <IoMdCheckmark size={26} className="-mb-0.5 -mx-1" />;
    text = "Accept request";
    color = "bg-color-information-500 hover:bg-color-information-600";
  }

  return (
    <Button
      onClick={() => sendFriendRequest(username, action)}
      className={`${color} px-6 py-2 disabled:bg-color-neutral-600 disabled:text-color-neutral-200`}
      disabled={disabled}
      isLoading={friendsLoading}
    >
      {icon}
      {text}
    </Button>
  );
};

const Profile = () => {
  const { username } = useParams<string>();

  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading: friendsLoading,
    sendFriendRequest,
  } = useStore();
  const { socket } = useWebSocket();
  const { isAuth } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] =
    useState<boolean>(false);
  const { currentUser, token } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  useEffect(() => {
    setIsOwner(username === currentUser?.username);
  }, [currentUser, username, socket]);

  useEffect(() => {
    if (!socket || !token) return;

    fetchUserData(username!, token, setUserData, setError, setLoading).catch(
      (err) => {
        console.error(err);
      },
    );

    socket.emit("isUserOnline", username, (online: boolean) => {
      setIsOnline(online);
    });
  }, [username, socket]);

  const bestRating = userData ? getBestRating(userData.perfs) : null;

  const title = bestRating
    ? `${username} (${Math.round(bestRating.elo)}) - ultiTTT`
    : undefined;

  const description = bestRating
    ? `${username}'s ${bestRating.type} rating is ${Math.round(bestRating.elo)} with ${bestRating.allR} rated games`
    : `${username}'s profile`;

  useClientSeo({
    description,
    title,
  });

  if (loading) {
    return <LoadingCircle />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 mt-12">
        <div className="text-3xl font-medium">{error}</div>
        <Button asChild className="bg-color-accent-400 px-4 py-2 mt-2">
          <Link to="/">
            <BiHome className="h-full" />
            Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-row justify-center gap-6 max-w-[1440px]">
      <div className="max-w-[1073px] w-full">
        <div className="bg-color-neutral-800 border-y-[2px] lg:border-y-0 border-color-neutral-500 mb-6 w-full lg:rounded-md">
          <div className="sm:pt-3 h-full lg:px-9 flex flex-col lg:flex-row justify-between">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row px-2 lg:pr-8 justify-center lg:justify-start gap-1 sm:gap-8 min-h-28 w-full">
                <div className="sm:bg-color-neutral-850 sm:rounded-md p-1.5 sm:p-3 min-w-64 md:min-w-72 sm:border-b-[3px] border-color-accent-300">
                  <div className="text-2xl font-medium text-start flex items-center">
                    <span className="mr-1.5 truncate max-w-80">
                      {userData!.username}
                    </span>{" "}
                    {userData!.supporter ? (
                      <a href={"/donate"}>
                        <BiSolidStar className="text-color-accent-300" />
                      </a>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-color-neutral-300 text-start text-[13px] sm:text-[15px] sm:text-wrap sm:line-clamp-3 truncate max-w-[90%] sm:max-w-80 max-h-24">
                    {userData!.profile.bio ? userData!.profile.bio : "No bio."}
                  </div>
                </div>
                <div className="sm:bg-color-neutral-850 sm:rounded-md sm:border-b-[3px] border-color-accent-300 justify-center mr-0 sm:mr-1 md:mr-0 items-center my-2 sm:my-0 flex lg:mx-auto sm:px-4 lg:px-9 gap-4 lg:gap-8 text-[14px] min-w-fit sm:text-[16px]">
                  <div className="flex flex-col items-center justify-between h-16 lg:h-24 font-normal text-color-neutral-200">
                    <HiStatusOnline
                      className={`${
                        isOnline ? "text-color-green-1" : ""
                      } w-9 h-9 sm:w-11 sm:h-11 mt-1.5`}
                    />
                    {isOnline ? (
                      <div className="flex gap-x-1 lg:flex-col">
                        <div>Online</div>
                        <div>Now</div>
                      </div>
                    ) : (
                      <>
                        <div className="hidden lg:flex">Last online</div>
                        <div>{timeAgo(userData!.lastOnline)}</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-end h-16 lg:h-24 font-normal text-color-neutral-200">
                    <MdCake className="w-10 h-10 sm:w-12 sm:h-12" />
                    <div className="hidden lg:flex">Member since</div>
                    <div className="text-nowrap">
                      {formatDate(userData!.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-end h-16 lg:h-24 font-normal text-color-neutral-200">
                    <a href="/donate">
                      {userData!.supporter ? (
                        <AiFillHeart className="w-9 h-9 sm:w-11 sm:h-11 text-color-accent-300" />
                      ) : (
                        <FaHeartCrack className="w-8 h-8 sm:w-10 sm:h-10" />
                      )}
                    </a>
                    <div className={`lg:h-12 `}>
                      {userData!.supporter ? (
                        "Supporter"
                      ) : (
                        <>
                          No
                          <b className="font-normal  inline sm:hidden md:inline">
                            t a
                          </b>{" "}
                          <br className="hidden lg:flex" /> Supporter
                        </>
                      )}{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start lg:ml-8 items-center my-6 lg:my-8 gap-4 flex-wrap mx-2">
                {isOwner ? (
                  <Button
                    asChild
                    className="bg-color-neutral-700 px-6 py-2 hover:bg-color-neutral-600"
                  >
                    <Link to={APP_ROUTES.Settings}>
                      <FaEdit size={18} />
                      Edit
                    </Link>
                  </Button>
                ) : (
                  <Fragment>
                    <Button
                      title={!isOnline ? "User is offline" : undefined}
                      onClick={() =>
                        setIsChallengeModalOpen(isOnline && !isOwner)
                      }
                      className={`bg-color-accent-400 hover:bg-color-accent-500 disabled:bg-color-neutral-600 text-color-neutral-100 disabled:text-color-neutral-200 px-6 py-2`}
                      disabled={!isOnline || !isAuth}
                    >
                      <RiSwordLine size={20} className="-mb-0.5" />
                      Challenge
                    </Button>
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
                  </Fragment>
                )}
              </div>
            </div>
            <Socials socials={userData!.socials} />
          </div>
        </div>
        <div className="2xl:hidden flex flex-col justify-center border-y-[2px] lg:border-y-0 border-color-neutral-500 bg-color-neutral-800  lg:rounded-md mb-6 pt-2 p-4 sm:px-12 lg:px-24">
          <h1 className="text-[20px] font-bold mb-3">Stats</h1>

          <div className=" flex flex-wrap w-full justify-between ">
            {(["bullet", "blitz", "rapid", "standard"] as const).map(
              (gameType) => (
                <div className="flex flex-col gap-1 sm:text-lg" key={gameType}>
                  <h1 className="capitalize font-normal">{gameType}</h1>
                  <div className="text-[20px] font-medium">
                    {Math.round(userData!.perfs[gameType].elo)}
                  </div>
                  <div className="text-[18px] text-color-neutral-200">
                    {userData!.perfs[gameType].allR} games
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="bg-color-neutral-800 max-w-[1073px] border-y-[2px] lg:border-y-0 border-color-neutral-500 w-full lg:rounded-md overflow-hidden py-8 sm:px-8">
          <GameHistory username={username!} />
        </div>
      </div>
      <div className="hidden 2xl:flex flex-col items-center bg-color-neutral-800 max-w-[344px] w-full h-[700px] rounded-md">
        <h1 className="text-[20px] font-bold mt-2.5">Stats</h1>
        <div className="flex flex-col gap-3 mt-4">
          <ProfileStats userData={userData} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
