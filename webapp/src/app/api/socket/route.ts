import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

// Disable edge runtime since Socket.IO needs Node.js
export const runtime = 'nodejs';

let io: SocketIOServer;

export async function GET(req: Request, res: NextApiResponse) {
  if (!io) {
    const server = (res as any)?.socket?.server as NetServer;
    
    if (!server) {
      return NextResponse.error();
    }
    
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.emit('welcome', 'Welcome to Wrale Radiate!');

      socket.on('message', (data) => {
        console.log('Message received:', data);
        io.emit('message', data); // Broadcast to all clients
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    (res as any).socket.server.io = io;
  }

  return NextResponse.json({ success: true });
}
