import { NextRequest } from 'next/server'
import { IncomingMessage } from 'http'
import { getWebSocketServer } from '@/lib/websocket'

export async function GET(req: NextRequest) {
  const upgradeHeader = req.headers.get('upgrade')
  if (!upgradeHeader?.toLowerCase()?.includes('websocket')) {
    return new Response('Upgrade Required', { status: 426 })
  }

  try {
    // Get the WebSocket server instance
    const wss = getWebSocketServer()

    // Get the raw Node request and socket
    const nodeReq = Reflect.get(req, 'socket').parser.incoming as IncomingMessage
    const socket = nodeReq.socket

    if (!socket) {
      throw new Error('No socket found')
    }

    // Perform the upgrade
    wss.handleUpgrade(nodeReq, socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws)
    })

    // The response is handled by the WebSocket upgrade
    return new Response(null)
  } catch (err) {
    console.error('WebSocket upgrade failed:', err)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}
