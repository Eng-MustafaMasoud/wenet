"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { useNotifications } from "./NotificationSystem";

interface ConnectionState {
  isOnline: boolean;
  wsConnected: boolean;
  lastSeen: Date | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
}

interface ConnectionContextType extends ConnectionState {
  attemptReconnect: () => void;
  forceReconnect: () => void;
  subscribe: (callback: (state: ConnectionState) => void) => () => void;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

interface ConnectionManagerProps {
  children: React.ReactNode;
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export function ConnectionManager({
  children,
  wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  heartbeatInterval = 30000,
}: ConnectionManagerProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    wsConnected: false,
    lastSeen: null,
    reconnectAttempts: 0,
    isReconnecting: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscribersRef = useRef<Set<(state: ConnectionState) => void>>(
    new Set()
  );
  const notifications = useNotifications();

  // Notify subscribers
  const notifySubscribers = useCallback((state: ConnectionState) => {
    subscribersRef.current.forEach((callback) => callback(state));
  }, []);

  // Update connection state
  const updateConnectionState = useCallback(
    (updates: Partial<ConnectionState>) => {
      setConnectionState((prev) => {
        const newState = { ...prev, ...updates };
        notifySubscribers(newState);
        return newState;
      });
    },
    [notifySubscribers]
  );

  // Clear timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    clearTimeouts();

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));

        // Set timeout for pong response
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn("WebSocket heartbeat timeout");
          wsRef.current?.close();
        }, 5000);
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, clearTimeouts]);

  // Connect WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      updateConnectionState({ isReconnecting: true });
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        updateConnectionState({
          wsConnected: true,
          lastSeen: new Date(),
          reconnectAttempts: 0,
          isReconnecting: false,
        });
        startHeartbeat();
        notifications.showSuccess(
          "Connected",
          "Real-time updates are now available"
        );
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        updateConnectionState({ wsConnected: false, isReconnecting: false });
        clearTimeouts();

        // Auto-reconnect if not a manual close
        if (
          event.code !== 1000 &&
          connectionState.reconnectAttempts < maxReconnectAttempts
        ) {
          scheduleReconnect();
        } else if (connectionState.reconnectAttempts >= maxReconnectAttempts) {
          notifications.showError(
            "Connection Failed",
            "Unable to establish real-time connection after multiple attempts",
            true
          );
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        updateConnectionState({ wsConnected: false, isReconnecting: false });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "pong") {
            // Clear heartbeat timeout on pong
            if (heartbeatTimeoutRef.current) {
              clearTimeout(heartbeatTimeoutRef.current);
              heartbeatTimeoutRef.current = null;
            }
            updateConnectionState({ lastSeen: new Date() });
          }

          // Handle other message types here
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      updateConnectionState({ wsConnected: false, isReconnecting: false });
      scheduleReconnect();
    }
  }, [
    wsUrl,
    connectionState.reconnectAttempts,
    maxReconnectAttempts,
    updateConnectionState,
    startHeartbeat,
    notifications,
    clearTimeouts,
  ]);

  // Schedule reconnect
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      return; // Already scheduled
    }

    const attempts = connectionState.reconnectAttempts + 1;
    const delay = Math.min(
      reconnectInterval * Math.pow(2, attempts - 1),
      30000
    ); // Exponential backoff, max 30s

    console.log(
      `Scheduling WebSocket reconnect attempt ${attempts} in ${delay}ms`
    );

    updateConnectionState({
      reconnectAttempts: attempts,
      isReconnecting: true,
    });

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectWebSocket();
    }, delay);
  }, [
    connectionState.reconnectAttempts,
    reconnectInterval,
    updateConnectionState,
    connectWebSocket,
  ]);

  // Manual reconnect
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateConnectionState({ reconnectAttempts: 0 });
    connectWebSocket();
  }, [updateConnectionState, connectWebSocket]);

  // Force reconnect (close and reconnect)
  const forceReconnect = useCallback(() => {
    wsRef.current?.close(1000, "Manual reconnect");
    updateConnectionState({ reconnectAttempts: 0 });
    setTimeout(connectWebSocket, 100);
  }, [updateConnectionState, connectWebSocket]);

  // Subscribe to connection state changes
  const subscribe = useCallback(
    (callback: (state: ConnectionState) => void) => {
      subscribersRef.current.add(callback);
      return () => {
        subscribersRef.current.delete(callback);
      };
    },
    []
  );

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateConnectionState({ isOnline: true });
      if (!connectionState.wsConnected) {
        attemptReconnect();
      }
    };

    const handleOffline = () => {
      updateConnectionState({ isOnline: false });
      notifications.showConnectionStatus(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [
    updateConnectionState,
    connectionState.wsConnected,
    attemptReconnect,
    notifications,
  ]);

  // Initial connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      clearTimeouts();
      wsRef.current?.close(1000, "Component unmount");
    };
  }, [connectWebSocket, clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmount");
      }
    };
  }, [clearTimeouts]);

  const contextValue: ConnectionContextType = {
    ...connectionState,
    attemptReconnect,
    forceReconnect,
    subscribe,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
      <ConnectionStatusIndicator />
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionManager");
  }
  return context;
}

function ConnectionStatusIndicator() {
  const { isOnline, wsConnected, isReconnecting, attemptReconnect } =
    useConnection();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator when offline or WebSocket disconnected
    setShowIndicator(!isOnline || !wsConnected);
  }, [isOnline, wsConnected]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div
        className={`
        connection-indicator rounded-lg shadow-lg p-3 transition-all duration-300
        ${
          !isOnline
            ? "connection-offline"
            : isReconnecting
            ? "connection-reconnecting"
            : "connection-offline"
        }
      `}
      >
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {!isOnline ? (
              <WifiOff className="w-5 h-5" />
            ) : isReconnecting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {!isOnline
                ? "No Internet Connection"
                : isReconnecting
                ? "Reconnecting..."
                : "Connection Lost"}
            </p>
            <p className="text-xs opacity-90">
              {!isOnline
                ? "Check your network connection"
                : isReconnecting
                ? "Attempting to restore real-time updates"
                : "Real-time updates unavailable"}
            </p>
          </div>

          {!isReconnecting && (
            <button
              onClick={attemptReconnect}
              className="flex-shrink-0 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors focus-ring"
              aria-label="Retry connection"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for components that need real-time data
export function useRealtimeData<T>(
  initialData: T,
  dataKey: string,
  onUpdate?: (data: T) => void
) {
  const [data, setData] = useState<T>(initialData);
  const { wsConnected, subscribe } = useConnection();

  useEffect(() => {
    const unsubscribe = subscribe((connectionState) => {
      if (!connectionState.wsConnected) {
        // Handle disconnection - could show stale data indicator
        console.log(`Realtime data for ${dataKey} may be stale`);
      }
    });

    return unsubscribe;
  }, [dataKey, subscribe]);

  const updateData = useCallback(
    (newData: T) => {
      setData(newData);
      onUpdate?.(newData);
    },
    [onUpdate]
  );

  return {
    data,
    updateData,
    isStale: !wsConnected,
    isConnected: wsConnected,
  };
}
