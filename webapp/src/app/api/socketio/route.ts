import { NextRequest } from 'next/server';

// Use Edge Runtime
export const runtime = 'edge';

type WebSocketMessage = {
  type: string;
  message: string;
};

interface WebSocketWithAccept extends WebSocket {
  accept(): void;
}

const sockets = new Map<string, WebSocketWithAccept>();

export async function GET(request: NextRequest) {
  if (!request.headers.get('upgrade')) {
    return new Response('Expected Upgrade header', { status: 426 });
  }

  const { socket, response } = Reflect.get(globalThis, 'WebSocketPair') 
    ? new (Reflect.get(globalThis, 'WebSocketPair'))() 
    : { socket: undefined, response: undefined };

  if (!socket || !response) {
    return new Response('WebSocket initialization failed', { status: 500 });
  }

  socket.accept();

  socket.addEventListener('message', (event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('Message received:', message);

      // Broadcast to all other sockets
      sockets.forEach((clientSocket, id) => {
        if (clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({
            type: 'broadcast',
            message: message.message
          }));
        }
      });
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  socket.addEventListener('close', () => {
    // Remove socket when closed
    const socketId = Array.from(sockets.entries())
      .find(([id, s]) => s === socket)?.[0];
    
    if (socketId) {
      sockets.delete(socketId);
      console.log('Client disconnected:', socketId);
    }
  });

  // Add new socket to the map
  const socketId = crypto.randomUUID();
  sockets.set(socketId, socket as WebSocketWithAccept);
  console.log('Client connected:', socketId);

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to Wrale Radiate'
  }));

  return response;
}
