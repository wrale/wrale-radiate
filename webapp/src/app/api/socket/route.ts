import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiResponse } from 'next';
import { Socket } from 'net';

interface ResponseWithSocket extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
}

export function GET(req: Request) {
  const response = new NextResponse();
  const server = (response as unknown as ResponseWithSocket).socket?.server;

  if (server && !server.io) {
    console.log('Creating Socket.IO server...');
    const io = new SocketIOServer(server);

    io.on('connection', (socket) => {
      const clientId = socket.id;
      console.log('Client connected:', clientId);

      socket.on('health', (data) => {
        console.log('Health update from', clientId, ':', data);
      });

      socket.emit('connected', { id: clientId });

      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', clientId, reason);
      });

      socket.on('error', (error) => {
        console.error('Socket error from', clientId, ':', error);
      });
    });

    server.io = io;
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';