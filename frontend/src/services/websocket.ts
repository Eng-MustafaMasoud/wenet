import {
  WSMessage,
  WSSubscribeMessage,
  WSUnsubscribeMessage,
  WSZoneUpdateMessage,
  WSAdminUpdateMessage,
  Zone,
} from '@/types/api';

type MessageHandler = (message: WSZoneUpdateMessage | WSAdminUpdateMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private subscribedGates: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === '192.168.1.3') {
        return 'ws://192.168.1.3:3000/api/v1/ws';
      }
    }
    return 'ws://localhost:3000/api/v1/ws';
  }

  private connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Re-subscribe to previously subscribed gates
        this.subscribedGates.forEach(gateId => {
          this.subscribe(gateId);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: WSMessage): void {
    if (message.type === 'zone-update' || message.type === 'admin-update') {
      this.messageHandlers.forEach(handler => {
        try {
          handler(message as WSZoneUpdateMessage | WSAdminUpdateMessage);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  public subscribe(gateId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, will subscribe when connected');
      this.subscribedGates.add(gateId);
      return;
    }

    const message: WSSubscribeMessage = {
      type: 'subscribe',
      payload: { gateId }
    };

    this.ws.send(JSON.stringify(message));
    this.subscribedGates.add(gateId);
    console.log(`Subscribed to gate: ${gateId}`);
  }

  public unsubscribe(gateId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.subscribedGates.delete(gateId);
      return;
    }

    const message: WSUnsubscribeMessage = {
      type: 'unsubscribe',
      payload: { gateId }
    };

    this.ws.send(JSON.stringify(message));
    this.subscribedGates.delete(gateId);
    console.log(`Unsubscribed from gate: ${gateId}`);
  }

  public addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  public getConnectionState(): 'connecting' | 'open' | 'closed' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (!this.ws) return 'closed';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'error';
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribedGates.clear();
    this.messageHandlers.clear();
    this.reconnectAttempts = 0;
  }

  public reconnect(): void {
    this.disconnect();
    this.connect();
  }
}

// Create singleton instance
export const wsService = new WebSocketService();
export default wsService;
