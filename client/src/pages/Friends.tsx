import React from "react";
import { useStore } from "../context/StoreContext";

const Friends = () => {
  const { friends, incomingRequests, outgoingRequests } = useStore();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-x-16 gap-y-8">
      <div>
        <b>Friends:</b>
        {friends && friends.map((friend) => <div key={friend}>{friend}</div>)}
      </div>
      <div>
        <b>Incoming Requests:</b>
        {incomingRequests &&
          incomingRequests.map((request) => <div key={request.id}>{request.fromUsername}</div>)}
      </div>
      <div>
        <b>Outgoing Requests:</b>
        {outgoingRequests &&
          outgoingRequests.map((request) => <div key={request.id}>{request.toUsername}</div>)}
      </div>
    </div>
  );
};

export default Friends;
