import { NextResponse } from 'next/server';

// Enable edge runtime
export const runtime = 'edge';

const connectedClients = new Set<WebSocket>();

export async function GET(request: Request) {
  if (!request.headers.get('upgrade')?.toLowerCase().includes('websocket')) {
    return new NextResponse('Expected websocket connection', { status: 400 });
  }

  try {
    // Create WebSocket pair
    const { socket, response } = Reflect.get(globalThis, 'WebSocketPair')
      ? new (Reflect.get(globalThis, 'WebSocketPair'))() 
      : { socket: undefined, response: undefined };

    if (!socket || !response) {
      console.error('WebSocket creation failed');
      return new NextResponse('WebSocket initialization failed', { status: 500 });
    }

    // Handle socket events
    socket.accept();
    connectedClients.add(socket);

    socket.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
      // Broadcast to all other clients
      connectedClients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(event.data);
        }
      });
    });

    socket.addEventListener('close', () => {
      connectedClients.delete(socket);
    });

    return response;
  } catch (err) {
    console.error('WebSocket handler error:', err);
    return new NextResponse('WebSocket setup failed', { status: 500 });
  }
}
