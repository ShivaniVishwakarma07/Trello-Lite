import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications((current) => [notification, ...current]);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        clearNotifications,
      }}
    >
      const {user} = useAuth();
      {children}
    </NotificationContext.Provider>
  );
};
useEffect(() => {
  if (!user?._id) {
    return;
  }

  socket.emit("join-user", user._id);
}, [user]);

export const useNotifications = () => {
  return useContext(NotificationContext);
};
