import { type NextApiResponse } from 'next';
import { type NextApiRequest } from 'next';
import { initWebSocket } from '@/lib/websocket';

export const dynamic = 'force-dynamic';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  // Initialize WebSocket if needed
  if (process.env.NODE_ENV !== 'production' && (res as any)?.socket?.server) {
    initWebSocket((res as any).socket.server);
  }
  
  return new Response('WebSocket endpoint ready', { status: 200 });
}
