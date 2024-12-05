import { NextResponse } from 'next/server';
import type { NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Socket } from 'net';
import { WebSocketServer } from 'ws';

interface ResponseWithSocket extends NextApiResponse {
  socket: Socket & {
    server: HTTPServer & {
      ws?: WebSocketServer;
    };
  };
}

export function GET(req: Request) {
  const response = new NextResponse();
  
  // Access the server instance
  const server = (response as unknown as ResponseWithSocket).socket?.server;
  
  if (server && !server.ws) {
    const wsServer = new WebSocketServer({ noServer: true });
    
    wsServer.on('connection', (ws) => {
      console.log('Client connected');
      ws.send('Welcome!');
      
      ws.on('message', (message) => {
        console.log('received: %s', message);
      });
    });
    
    server.ws = wsServer;
    
    server.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    });
  }
  
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';