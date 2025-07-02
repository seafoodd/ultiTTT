import React, { createContext, ReactNode, useContext, useState } from "react";
import NotificationContainer from "../../components/notifications/NotificationContainer";

interface NotificationContextType {
  addNotification: (
    message: string,
    type: "error" | "info" | "success" | "challenge",
    from?: string,
    gameId?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<any[]>([
    // {
    //   id: 1,
    //   message: "Updated",
    //   type: "success",
    // },
    // {
    //   id: 2,
    //   message: "Connecting to the room",
    //   type: "info",
    // },
    // {
    //   id: 3,
    //   message: "The bio is too long",
    //   type: "error",
    // },
  ]);

  const addNotification = (
    message: string,
    type: "error" | "info" | "success" | "challenge",
    from?: string,
    gameId?: string
  ) => {
    if (notifications.length >= 10) {
      setNotifications((prevNotifications) => prevNotifications.slice(1));
    }
    const id = Date.now() + Math.random();
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { id, message, type, gameId, from },
    ]);
    if (type === "challenge") return;
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};
