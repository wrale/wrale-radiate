import { NextResponse } from 'next/server'
import { getWebSocketServer } from '@/lib/websocket'

export function GET(req: Request) {
  if (!req.headers.get('upgrade')?.toLowerCase()?.includes('websocket')) {
    return new Response('Upgrade Required', { status: 426 })
  }

  try {
    const wss = getWebSocketServer()
    const { socket, response } = Reflect.get(req, 'socket')
    
    wss.handleUpgrade(req, socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws)
    })

    return response
  } catch (err) {
    console.error('WebSocket upgrade failed:', err)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}
