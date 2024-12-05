import { WebSocketServer } from 'ws'
import type { WebSocket as WSType } from 'ws'
import type { WebSocketMessage } from '@/lib/types'

type CustomWebSocket = WSType & {
  displayId?: string
}

const wss = new WebSocketServer({ noServer: true })
const clients = new Set<CustomWebSocket>()

wss.on('connection', (ws: CustomWebSocket) => {
  console.log('Client connected')
  clients.add(ws)

  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString())
      if (message.type === 'health') {
        ws.displayId = message.displayId
        // Handle health update
        console.log('Health update from', message.displayId)
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
    clients.delete(ws)
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
    clients.delete(ws)
  })

  // Send initial connection acknowledgment
  ws.send(JSON.stringify({ type: 'connected' }))
})

export function GET(req: Request) {
  const upgrade = req.headers.get('upgrade')?.toLowerCase()
  if (upgrade !== 'websocket') {
    return new Response('Expected Upgrade: WebSocket', { status: 426 })
  }

  try {
    const { socket: connection, response } = Reflect.get(req, 'socket')
    wss.handleUpgrade(req as any, connection, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws)
    })
    return response
  } catch (error) {
    console.error('WebSocket setup error:', error)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}

// Helper function to broadcast messages to all clients
export function broadcast(message: WebSocketMessage) {
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(message))
    }
  })
}
