import { type NextRequest } from 'next/server';
import { initWebSocket } from '@/lib/websocket';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    try {
      const response = new Response(null, {
        status: 101,
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
        },
      });

      // Get raw response and initialize WebSocket
      const res = response as any;
      if (res.socket?.server) {
        initWebSocket(res.socket.server);
      }

      return response;
    } catch (err) {
      console.error('WebSocket initialization error:', err);
      return new Response('WebSocket initialization failed', { status: 500 });
    }
  }

  return new Response('Expected WebSocket upgrade', { status: 426 });
}
