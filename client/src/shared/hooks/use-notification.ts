import { useNotifications } from "../provider/notification-provider";

const useNotification = () => {
  const { addNotification } = useNotifications();

  const showError = (message: string) => {
    addNotification(message, "error");
  };
  const showInformation = (message: string) => {
    addNotification(message, "info");
  };
  const showSuccess = (message: string) => {
    addNotification(message, "success");
  };
  const showChallenge = (gameType: string, from: string, gameId: string) => {
    addNotification(gameType, "challenge", from, gameId);
  };

  return { showError, showInformation, showSuccess, showChallenge };
};

export default useNotification;
