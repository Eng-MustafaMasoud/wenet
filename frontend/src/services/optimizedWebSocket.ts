import {
  WSMessage,
  WSSubscribeMessage,
  WSUnsubscribeMessage,
  WSZoneUpdateMessage,
  WSAdminUpdateMessage,
  Zone,
} from "@/types/api";

type MessageHandler = (
  message: WSZoneUpdateMessage | WSAdminUpdateMessage
) => void;
type ConnectionHandler = (connected: boolean) => void;

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageQueue: WSMessage[];
  offlineMode: boolean;
}

class OptimizedWebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private subscribedGates: Set<string> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private config: WebSocketConfig;
  private messageQueue: WSMessage[] = [];
  private isOffline = false;

  constructor() {
    this.config = {
      url: "ws://localhost:3000/api/v1/ws",
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      messageQueue: [],
      offlineMode: false,
    };

    this.setupOfflineDetection();
    this.setupMessagePersistence();
  }

  private setupOfflineDetection() {
    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOffline = false;
        this.connectionHandlers.forEach((handler) => handler(true));
        this.connect();
      });

      window.addEventListener("offline", () => {
        this.isOffline = true;
        this.connectionHandlers.forEach((handler) => handler(false));
        this.disconnect();
      });
    }
  }

  private setupMessagePersistence() {
    // Load persisted messages from localStorage
    if (typeof window !== "undefined") {
      try {
        const persisted = localStorage.getItem("ws-message-queue");
        if (persisted) {
          this.messageQueue = JSON.parse(persisted);
        }
      } catch (error) {
        console.warn("Failed to load persisted messages:", error);
      }
    }
  }

  private persistMessages() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "ws-message-queue",
          JSON.stringify(this.messageQueue)
        );
      } catch (error) {
        console.warn("Failed to persist messages:", error);
      }
    }
  }

  private connect(): void {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (this.isOffline) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.isOffline = false;

        // Notify connection handlers
        this.connectionHandlers.forEach((handler) => handler(true));

        // Re-subscribe to previously subscribed gates
        this.subscribedGates.forEach((gateId) => {
          this.subscribe(gateId);
        });

        // Process queued messages
        this.processMessageQueue();

        // Start heartbeat
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();

        // Notify connection handlers
        this.connectionHandlers.forEach((handler) => handler(false));

        if (!this.isOffline) {
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send a ping message instead of using unsupported ping() method
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WSMessage): void {
    if (message.type === "zone-update" || message.type === "admin-update") {
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message as WSZoneUpdateMessage | WSAdminUpdateMessage);
        } catch (error) {
          console.error("Error in message handler:", error);
        }
      });
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.handleMessage(message);
      }
    }
    this.persistMessages();
  }

  public subscribe(gateId: string): void {
    this.subscribedGates.add(gateId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, will subscribe when connected");
      return;
    }

    const message: WSSubscribeMessage = {
      type: "subscribe",
      payload: { gateId },
    };

    this.sendMessage(message);
    console.log(`Subscribed to gate: ${gateId}`);
  }

  public unsubscribe(gateId: string): void {
    this.subscribedGates.delete(gateId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSUnsubscribeMessage = {
      type: "unsubscribe",
      payload: { gateId },
    };

    this.sendMessage(message);
    console.log(`Unsubscribed from gate: ${gateId}`);
  }

  private sendMessage(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
      this.persistMessages();
    }
  }

  public addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  public addConnectionHandler(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);

    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  public getConnectionState():
    | "connecting"
    | "open"
    | "closed"
    | "error"
    | "offline" {
    if (this.isOffline) return "offline";
    if (this.isConnecting) return "connecting";
    if (!this.ws) return "closed";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "open";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "closed";
      default:
        return "error";
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && !this.isOffline;
  }

  public getOfflineMode(): boolean {
    return this.isOffline;
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  public disconnect(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscribedGates.clear();
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
    this.reconnectAttempts = 0;
  }

  public reconnect(): void {
    this.disconnect();
    this.connect();
  }

  public clearMessageQueue(): void {
    this.messageQueue = [];
    this.persistMessages();
  }
}

// Create singleton instance
export const optimizedWsService = new OptimizedWebSocketService();
export default optimizedWsService;
