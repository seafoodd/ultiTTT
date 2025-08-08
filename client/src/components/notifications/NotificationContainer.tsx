import React from "react";
import { RxCross2 } from "react-icons/rx";
import { Notification } from "@/shared/lib/client/interfaces";
import { useWebSocket } from "@/shared/providers/websocket-provider";

interface NotificationContainerProps {
  notifications: Notification[];
  removeNotification: (id: number) => void;
}

const getColor = {
  error:
    "bg-color-danger-700/50 border-2 backdrop-blur-sm border-color-danger-700",
  info: "bg-color-accent-700/50 border-2 backdrop-blur-sm border-color-accent-700",
  challenge:
    "bg-color-accent-700/50 border-2 backdrop-blur-sm border-color-accent-700",
  success:
    "bg-color-success-700/50 border-2 backdrop-blur-sm border-color-success-700",
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  removeNotification,
}) => {
  const { socket } = useWebSocket();

  const respondChallenge = (
    gameId: string,
    from: string,
    accepted: boolean,
    notificationId: number
  ) => {
    if (!socket) return;

    if (accepted) {
      window.location.href = `/${gameId}`;
    } else {
      socket.emit("declineChallenge", gameId, from);
      removeNotification(notificationId);
    }
  };

  return (
    <div className="fixed bottom-5 right-1/2 sm:right-5 z-50 translate-x-1/2 sm:translate-x-0 flex flex-col gap-2.5">
      {notifications.map((notification: Notification) => (
        <button
          key={notification.id}
          onClick={() =>
            notification.gameId === undefined &&
            removeNotification(notification.id)
          }
          className={`${
            getColor[notification.type]
          } text-white relative font-normal p-2.5 text-md rounded-md flex justify-between items-center w-[320px] shadow-md`}
        >
          {notification.type === "challenge" ? (
            <div>
              <span className="max-w-24 truncate mr-1">
                {notification.from}
              </span>
              challenged you to a {notification.message} game!
              <div className="flex font-bold justify-center items-center gap-8">
                <div
                  role="button"
                  onClick={() =>
                    respondChallenge(
                      notification.gameId as string,
                      notification.from as string,
                      true,
                      notification.id
                    )
                  }
                >
                  Accept
                </div>
                <div
                  role="button"
                  onClick={() =>
                    respondChallenge(
                      notification.gameId as string,
                      notification.from as string,
                      false,
                      notification.id
                    )
                  }
                >
                  Decline
                </div>
              </div>
            </div>
          ) : (
            <>
              <span className="truncate text-wrap line-clamp-6">
                {notification.message}
              </span>
              <RxCross2 size={20} />
            </>
          )}
        </button>
      ))}
    </div>
  );
};

export default NotificationContainer;
