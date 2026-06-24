import { useEffect, useState, useRef } from 'react';
import { WS_URL } from '@/services/api';

export function useWebSocket() {
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (e) {
          console.error('Failed to parse websocket message', e);
        }
      };

      ws.onopen = () => {
        console.log('Connected to WebSocket');
      };

      ws.onclose = () => {
        console.log('WebSocket closed. Reconnecting in 3 seconds...');
        timeoutId = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        // Silently handle error to avoid cluttering console during hot reloads
        // The onclose handler will automatically attempt reconnection
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(timeoutId);
      if (wsRef.current) {
        // Prevent reconnect on deliberate unmount
        wsRef.current.onclose = null; 
        wsRef.current.close();
      }
    };
  }, []);

  return { messages };
}
