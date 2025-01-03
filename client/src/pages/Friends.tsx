import React, { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";
import { GrStatusGoodSmall } from "react-icons/gr";
import Button from "../components/Button";
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import LoadingCircle from "../components/LoadingCircle";
import { RiSwordLine } from "react-icons/ri";
import Modal from "../components/Modal";
import ChallengeModal from "../components/ChallengeModal";

interface FriendElementProps {
  username: string;
  index: number;
  isOnline: boolean;
}
interface RequestElementProps {
  username: string;
  type: "incoming" | "outgoing";
}

const Friends = () => {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    onlineFriends,
    sendFriendRequest,
    loading,
  } = useStore();
  const [isChallengeModalOpen, setIsChallengeModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    console.log(onlineFriends);
  }, [onlineFriends]);

  const RequestElement: React.FC<RequestElementProps> = ({
    username,
    type,
  }) => {
    return (
      <div className="flex items-center w-full py-1 px-2">
        <a
          href={`/@/${username}`}
          className="font-normal hover:text-blue-300 transition-colors duration-75 mr-2"
        >
          <div className="max-w-24 truncate">{username}</div>
        </a>
        {type === "outgoing" ? (
          <Button
            icon={<IoClose size={20} />}
            className="bg-color-gray-3 w-5 h-5"
            onClick={() => sendFriendRequest(username, "add")}
          />
        ) : (
          <div className="flex gap-1 justify-center items-center">
            <Button
              icon={<IoMdCheckmark size={20} />}
              className="bg-color-green-1 w-5 h-5"
              onClick={() => sendFriendRequest(username, "add")}
            />
            <Button
              icon={<IoClose size={20} />}
              className="bg-color-red-1 w-5 h-5"
              onClick={() => sendFriendRequest(username, "add")}
            />
          </div>
        )}
      </div>
    );
  };

  const FriendElement: React.FC<FriendElementProps> = ({
    username,
    index,
    isOnline,
  }) => {
    return (
      <div
        key={username + index}
        className={`${index % 2 == 0 ? "" : "bg-white/10 "}flex items-center w-full py-1 px-8`}
      >
        <a
          className="flex items-center mr-auto transition-colors
              duration-75 hover:text-blue-300 "
          href={`/@/${username}`}
        >
          <GrStatusGoodSmall
            className={`mt-1 mr-1 ${
              isOnline
                ? "text-color-green-1 p-[1px]"
                : "stroke-color-gray-4 stroke-2 p-0.5 fill-transparent"
            }`}
          />
          <div className="font-normal max-w-40 truncate">{username}</div>
        </a>
        <div>
          <Button
            className={isOnline ? "hover:text-yellow-300" : "text-gray-500"}
            disabled={!isOnline}
            onClick={() => setIsChallengeModalOpen(isOnline)}
            icon={<RiSwordLine />}
          />
          <Modal
            isOpen={isChallengeModalOpen}
            setIsOpen={setIsChallengeModalOpen}
          >
            <ChallengeModal username={username} />
          </Modal>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex w-full flex-col lg:flex-row max-w-[1024px]
    justify-center border-y-2 lg:border-x-2 border-gray-600
    lg:rounded-xl bg-color-gray-1 min-h-[500px]"
    >
      <div className="flex-1/3 border-b-2 min-h-40 lg:border-r-2 lg:border-b-0 border-gray-600 py-4">
        <div className="font-bold text-2xl mb-2">Friends</div>
        <div className="overflow-y-auto max-h-[320px]">
          {friends.length > 0 ? (
            friends.map((username, index) => (
              <FriendElement
                key={username}
                username={username}
                index={index}
                isOnline={onlineFriends.includes(username)}
              />
            ))
          ) : loading ? (
            <LoadingCircle />
          ) : (
            <div className="text-gray-500">No friends.</div>
          )}
        </div>
      </div>
      <div className="flex lg:flex-col justify-center items-center min-h-20 divide-x-2 lg:divide-y-2 lg:divide-x-0 divide-gray-600">
        <div className="flex flex-col flex-1 py-2 w-full h-full">
          <div className="font-semibold text-md px-1">Incoming Requests</div>
          <div className="overflow-y-auto h-full px-4 max-h-48">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <RequestElement
                  key={request.username}
                  username={request.username}
                  type="incoming"
                />
              ))
            ) : loading ? (
              <LoadingCircle />
            ) : (
              <div className="text-gray-500">No incoming requests.</div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 py-2 w-full h-full">
          <div className="font-semibold text-md px-1">Outgoing Requests</div>
          <div className="overflow-y-auto h-full px-4 max-h-48">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map((request, key) => (
                <RequestElement
                  username={request.username}
                  key={key}
                  type="outgoing"
                />
              ))
            ) : loading ? (
              <LoadingCircle />
            ) : (
              <div className="text-gray-500">No outgoing requests.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
