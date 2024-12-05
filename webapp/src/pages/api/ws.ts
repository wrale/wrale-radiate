import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as WebSocketServer } from 'ws'
import type { WebSocketMessage } from '@/lib/types'

let wss: WebSocketServer | null = null

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws) => {
      console.log('Client connected')

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage
          console.log('Received message:', message)

          // Echo message back to sender
          ws.send(JSON.stringify({ type: 'connected' }))
        } catch (error) {
          console.error('Message handling error:', error)
        }
      })

      ws.on('close', () => {
        console.log('Client disconnected')
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
    })
  }

  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    res.status(426).json({ message: 'Upgrade Required' })
    return
  }

  try {
    // @ts-ignore - req.socket is available
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws)
    })
  } catch (err) {
    console.error('WebSocket upgrade failed:', err)
    res.status(500).json({ message: 'WebSocket setup failed' })
  }
}

// Disable body parsing for WebSocket upgrade
export const config = {
  api: {
    bodyParser: false,
  },
}