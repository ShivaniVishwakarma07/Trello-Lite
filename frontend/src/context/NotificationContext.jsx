import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user?._id) {
      if (socket.connected) {
        socket.disconnect();
      }

      return;
    }

    const joinUserRoom = () => {
      socket.emit("join-user", user._id);
    };

    socket.on("connect", joinUserRoom);

    if (!socket.connected) {
      socket.connect();
    } else {
      joinUserRoom();
    }

    return () => {
      socket.off("connect", joinUserRoom);
    };
  }, [user]);

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
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
