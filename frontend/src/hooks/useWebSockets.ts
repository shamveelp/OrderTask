import { useEffect, useState } from 'react';
import { WS_URL } from '@/services/api';

export function useWebSocket() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

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

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { messages };
}
