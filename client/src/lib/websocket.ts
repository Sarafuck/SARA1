type NotificationHandler = (notification: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private notificationHandlers: NotificationHandler[] = [];
  private userId: string | null = null;

  connect(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.userId = userId;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication message
        if (this.ws && this.userId) {
          this.ws.send(JSON.stringify({
            type: 'auth',
            userId: this.userId
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            this.notificationHandlers.forEach(handler => {
              try {
                handler(data.data);
              } catch (error) {
                console.error('Error in notification handler:', error);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        if (this.userId) {
          this.connect(this.userId);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.userId = null;
    this.reconnectAttempts = 0;
  }

  addNotificationHandler(handler: NotificationHandler) {
    this.notificationHandlers.push(handler);
  }

  removeNotificationHandler(handler: NotificationHandler) {
    const index = this.notificationHandlers.indexOf(handler);
    if (index > -1) {
      this.notificationHandlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();

// Helper hook for using WebSocket notifications in React components
export function useWebSocketNotifications(userId: string | undefined) {
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket
    wsManager.connect(userId);

    // Check connection status
    const checkConnection = () => {
      setIsConnected(wsManager.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(interval);
      wsManager.disconnect();
    };
  }, [userId]);

  const addNotificationHandler = React.useCallback((handler: NotificationHandler) => {
    wsManager.addNotificationHandler(handler);
    
    return () => {
      wsManager.removeNotificationHandler(handler);
    };
  }, []);

  return {
    isConnected,
    addNotificationHandler
  };
}

// Import React for the hook
import React from 'react';
