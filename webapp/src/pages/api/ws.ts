import { NextApiRequest, NextApiResponse } from 'next'
import { setupWebSocketServer } from '@/lib/websocket-server'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // WebSocket server is automatically initialized on first request
  if (!res.socket.server.ws) {
    console.log('Setting up WebSocket server')
    const httpServer = res.socket.server
    const ws = setupWebSocketServer(httpServer)
    res.socket.server.ws = ws
  }

  res.end()
}
