import { WebSocketServer } from 'ws';
import { NextRequest } from 'next/server';

let wss: WebSocketServer | null = null;

export async function GET(req: NextRequest) {
  // Handle WebSocket upgrade
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  try {
    // Create WebSocket server if it doesn't exist
    if (!wss) {
      wss = new WebSocketServer({ noServer: true });

      wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Wrale Radiate' }));

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.log('Received:', message);

            // Broadcast to all clients
            wss?.clients.forEach((client) => {
              if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                  type: 'broadcast',
                  message: message.message
                }));
              }
            });
          } catch (err) {
            console.error('Error processing message:', err);
          }
        });

        ws.on('close', () => {
          console.log('Client disconnected');
        });
      });
    }

    // Create response for WebSocket upgrade
    const response = new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': req.headers.get('sec-websocket-key') || ''
      }
    });

    return response;
  } catch (err) {
    console.error('WebSocket setup error:', err);
    return new Response('WebSocket setup failed', { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
