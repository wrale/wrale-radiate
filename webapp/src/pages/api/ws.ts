import type { NextApiRequest, NextApiResponse } from 'next'
import WebSocket from 'ws'
import type { WebSocketMessage } from '@/lib/types'

const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected')

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage
      console.log('[WebSocket] Received message:', message)

      // Echo message back to sender
      ws.send(JSON.stringify({ type: 'connected' }))
    } catch (error) {
      console.error('[WebSocket] Message handling error:', error)
    }
  })

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected')
  })

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error)
  })
})

wss.on('error', (error) => {
  console.error('[WebSocket] Server error:', error)
})

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[WebSocket] Upgrade request received')

  if (req.headers.upgrade?.toLowerCase() !== 'websocket') {
    console.log('[WebSocket] Non-WebSocket request rejected')
    res.status(426).json({ message: 'Upgrade Required' })
    return
  }

  try {
    console.log('[WebSocket] Processing upgrade request')

    const socket = req.socket
    const head = Buffer.alloc(0)

    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log('[WebSocket] Upgrade successful')
      wss.emit('connection', ws)
    })
  } catch (err) {
    console.error('[WebSocket] Upgrade failed:', err)
    res.status(500).json({ message: 'WebSocket setup failed' })
  }
}

// Disable body parsing for WebSocket upgrade
export const config = {
  api: {
    bodyParser: false,
  },
}
