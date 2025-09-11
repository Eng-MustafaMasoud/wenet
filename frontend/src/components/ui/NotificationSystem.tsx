"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary";
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showError: (title: string, message?: string, persistent?: boolean) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showConnectionStatus: (isOnline: boolean, isReconnecting?: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        duration:
          notification.duration ?? (notification.persistent ? undefined : 5000),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove if not persistent
      if (!notification.persistent && newNotification.duration) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showError = useCallback(
    (title: string, message?: string, persistent = false) => {
      addNotification({ type: "error", title, message, persistent });
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "success", title, message });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "warning", title, message });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "info", title, message });
    },
    [addNotification]
  );

  const showConnectionStatus = useCallback(
    (isOnline: boolean, isReconnecting = false) => {
      // Remove existing connection notifications
      setNotifications((prev) =>
        prev.filter((n) => !n.id.startsWith("connection-"))
      );

      if (!isOnline) {
        addNotification({
          type: "error",
          title: "Connection Lost",
          message: isReconnecting
            ? "Attempting to reconnect..."
            : "Please check your internet connection",
          persistent: true,
          actions: isReconnecting
            ? []
            : [
                {
                  label: "Retry",
                  action: () => window.location.reload(),
                  variant: "primary",
                },
              ],
        });
      } else {
        addNotification({
          type: "success",
          title: "Connection Restored",
          message: "You are back online",
          duration: 3000,
        });
      }
    },
    [addNotification]
  );

  const value: NotificationContextType = {
    addNotification,
    removeNotification,
    clearAll,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConnectionStatus,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

function NotificationContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function NotificationToast({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 200);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`
        relative bg-white border rounded-lg shadow-lg p-4 transition-all duration-200 ease-out transform
        ${
          isVisible && !isExiting
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        ${getColorClasses()}
      `}
      role="alert"
      aria-labelledby={`notification-title-${notification.id}`}
      aria-describedby={
        notification.message
          ? `notification-message-${notification.id}`
          : undefined
      }
    >
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          <p
            id={`notification-title-${notification.id}`}
            className="text-sm font-medium text-gray-900"
          >
            {notification.title}
          </p>

          {notification.message && (
            <p
              id={`notification-message-${notification.id}`}
              className="mt-1 text-sm text-gray-700"
            >
              {notification.message}
            </p>
          )}

          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    handleRemove();
                  }}
                  className={`
                    text-xs font-medium rounded px-3 py-1 transition-colors focus-ring
                    ${
                      action.variant === "primary"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 transition-colors focus-ring rounded"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Connection status hook
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      notifications.showConnectionStatus(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      notifications.showConnectionStatus(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [notifications]);

  const attemptReconnect = useCallback(() => {
    if (!isOnline) {
      setIsReconnecting(true);
      notifications.showConnectionStatus(false, true);

      // Simulate reconnection attempt
      setTimeout(() => {
        if (navigator.onLine) {
          setIsOnline(true);
          setIsReconnecting(false);
          notifications.showConnectionStatus(true);
        } else {
          setIsReconnecting(false);
          notifications.showConnectionStatus(false);
        }
      }, 3000);
    }
  }, [isOnline, notifications]);

  return { isOnline, isReconnecting, attemptReconnect };
}

// Server error handler hook
export function useServerErrorHandler() {
  const notifications = useNotifications();

  return useCallback(
    (error: any, context?: string) => {
      let title = "Something went wrong";
      let message = "Please try again later";
      let persistent = false;

      // Handle different error types
      if (error?.response?.status) {
        switch (error.response.status) {
          case 400:
            title = "Invalid Request";
            message =
              error.response.data?.message ||
              "Please check your input and try again";
            break;
          case 401:
            title = "Authentication Required";
            message = "Please log in to continue";
            persistent = true;
            break;
          case 403:
            title = "Access Denied";
            message = "You don't have permission to perform this action";
            break;
          case 404:
            title = "Not Found";
            message = "The requested resource could not be found";
            break;
          case 422:
            title = "Validation Error";
            message = error.response.data?.message || "Please check your input";
            break;
          case 500:
            title = "Server Error";
            message =
              "Our servers are experiencing issues. Please try again later";
            persistent = true;
            break;
          default:
            if (error.response.status >= 500) {
              title = "Server Error";
              persistent = true;
            }
        }
      } else if (error?.message) {
        message = error.message;
      }

      if (context) {
        title = `${context}: ${title}`;
      }

      notifications.showError(title, message, persistent);
    },
    [notifications]
  );
}
