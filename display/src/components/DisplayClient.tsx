'use client';

import { useEffect, useRef, useState } from 'react'

interface PlayCommand {
  type: 'play';
  url: string;
  contentId: string;
}

interface HealthUpdate {
  status: 'playing' | 'ready' | 'error';
  contentId?: string;
  error?: string;
}

export function DisplayClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<HealthUpdate['status']>('ready');
  const [error, setError] = useState<string>('');
  const [currentContent, setCurrentContent] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const connect = () => {
    if (retryCount >= maxRetries) {
      setStatus('error');
      setError(`Max retries (${maxRetries}) reached. Please refresh.`);
      return;
    }

    try {
      // Connect to Rust WebSocket server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:3002/ws`;
      console.log(`Connecting to WebSocket (attempt ${retryCount + 1}):`, wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('ready');
        setError('');
        // Send initial status
        sendHealthUpdate(ws, 'ready');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data) as PlayCommand;
          console.log('Received:', data);

          if (data.type === 'play' && videoRef.current) {
            setCurrentContent(data.contentId);
            
            try {
              videoRef.current.src = data.url;
              await videoRef.current.play();
              setStatus('playing');
              sendHealthUpdate(ws, 'playing', data.contentId);
            } catch (err) {
              console.error('Playback error:', err);
              setStatus('error');
              setError('Failed to play video');
              sendHealthUpdate(ws, 'error', data.contentId, 'Playback failed');
            }
          }
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
        setError('Connection error occurred');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setStatus('error');
        setError('Connection lost - retrying...');
        setSocket(null);

        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connect();
        }, delay);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Connection setup error:', error);
      setStatus('error');
      setError('Failed to setup connection');
    }
  };

  const sendHealthUpdate = (ws: WebSocket, status: HealthUpdate['status'], contentId?: string, error?: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      const update: HealthUpdate = {
        status,
        ...(contentId && { contentId }),
        ...(error && { error })
      };
      ws.send(JSON.stringify(update));
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !socket) return;

    const handleError = () => {
      setStatus('error');
      setError('Video playback error');
      sendHealthUpdate(socket, 'error', currentContent, 'Playback error');
    };

    const handleEnded = () => {
      setStatus('ready');
      sendHealthUpdate(socket, 'ready');
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [socket, currentContent]);

  return (
    <div className="relative h-screen bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
      />
      
      {status !== 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">
              {status === 'ready' ? 'Ready for content' : 'Error'}
            </p>
            {error && <p className="text-red-400">{error}</p>}
            {retryCount > 0 && (
              <p className="text-sm text-gray-400">
                Retry attempt {retryCount}/{maxRetries}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
