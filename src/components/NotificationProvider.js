"use client";

import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    ({ message, type = "success", duration = 3000 }) => {
      const id = Date.now() + Math.random();
      const notification = { id, message, type, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const hideNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) =>
      showNotification({ message, type: "success", duration }),
    [showNotification]
  );

  const error = useCallback(
    (message, duration) =>
      showNotification({ message, type: "error", duration }),
    [showNotification]
  );

  const warning = useCallback(
    (message, duration) =>
      showNotification({ message, type: "warning", duration }),
    [showNotification]
  );

  const info = useCallback(
    (message, duration) =>
      showNotification({ message, type: "info", duration }),
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({ notifications, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => onClose(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onClose }) {
  const { message, type } = notification;

  const typeStyles = {
    success: {
      bg: "bg-green-50 border-green-500",
      icon: "text-green-500",
      text: "text-green-800",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: "text-red-500",
      text: "text-red-800",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: "text-yellow-500",
      text: "text-yellow-800",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
    info: {
      bg: "bg-blue-50 border-blue-500",
      icon: "text-blue-500",
      text: "text-blue-800",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${style.bg} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right`}
      role="alert"
    >
      <svg
        className={`w-6 h-6 ${style.icon} flex-shrink-0`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={style.iconPath}
        />
      </svg>
      <div className={`flex-1 ${style.text} text-sm font-medium`}>
        {message}
      </div>
      <button
        onClick={onClose}
        className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
