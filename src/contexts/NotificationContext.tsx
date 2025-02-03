'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, { ...notification, id: Date.now(), read: false }]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((notification) => {
          if (notification.read) {
            const timeSinceRead = Date.now() - notification.id;
            return timeSinceRead < 30 * 60 * 1000; // 30 minutes
          }
          return true;
        })
      );
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};