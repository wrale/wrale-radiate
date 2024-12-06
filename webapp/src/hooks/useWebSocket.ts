'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketConfig {
  onMessage?: (data: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebSocket(config: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (retryCount >= maxRetries) {
      console.error(`Max retries (${maxRetries}) reached`);
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:3002/ws`;
      console.log(`Connecting to WebSocket (attempt ${retryCount + 1}):`, wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setRetryCount(0);
        config.onConnected?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          config.onMessage?.(data);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        wsRef.current = null;
        config.onDisconnected?.();

        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connect();
        }, delay);
      };
    } catch (error) {
      console.error('Connection setup error:', error);
    }
  }, [config, retryCount]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return {
    isConnected,
    sendMessage,
    retryCount
  };
}
