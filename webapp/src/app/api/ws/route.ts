import { WebSocket } from 'ws'
import { WebSocketMessage } from '@/lib/types'

const activeSockets = new Set<WebSocket>()

export function GET(request: Request) {
  // Handle the WebSocket upgrade request
  if (!('upgrade' in request.headers)) {
    return new Response('Not a WebSocket request', { status: 400 })
  }

  try {
    const upgrade = request.headers.get('upgrade')?.toLowerCase()
    if (upgrade !== 'websocket') {
      return new Response('Not a WebSocket request', { status: 400 })
    }

    const wsServer = new WebSocket.Server({ noServer: true })

    wsServer.on('connection', (ws) => {
      console.log('Client connected')
      activeSockets.add(ws)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          // Handle health updates or other messages
          console.log('Received message:', message)
        } catch (error) {
          console.error('Error processing message:', error)
        }
      })

      ws.on('close', () => {
        console.log('Client disconnected')
        activeSockets.delete(ws)
      })

      // Send initial connection acknowledgment
      ws.send(JSON.stringify({ type: 'connected' }))
    })

    return new Response(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade'
      }
    })
  } catch (error) {
    console.error('WebSocket error:', error)
    return new Response('WebSocket error', { status: 500 })
  }
}

// Function to broadcast messages to all connected clients
export function broadcast(message: WebSocketMessage) {
  activeSockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  })
}
