import type { NextApiRequest, NextApiResponse } from 'next'
import { getWebSocketServer } from '@/lib/websocket'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    res.status(426).json({ message: 'Upgrade Required' })
    return
  }

  try {
    const wss = getWebSocketServer()
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws)
    })
  } catch (err) {
    console.error('WebSocket upgrade failed:', err)
    res.status(500).json({ message: 'WebSocket setup failed' })
  }
}