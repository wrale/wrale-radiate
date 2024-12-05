import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server) {
  if (wss) {
    console.log('WebSocket server already initialized');
    return wss;
  }

  wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    ws.send('Connected to Wrale Radiate');

    ws.on('message', (message) => {
      console.log('Received:', message.toString());
      // Broadcast to all clients
      wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/ws') {
      wss?.handleUpgrade(request, socket, head, (ws) => {
        wss?.emit('connection', ws, request);
      });
    }
  });

  return wss;
}
