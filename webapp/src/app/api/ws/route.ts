import { WebSocketServer } from 'ws'
import { NextResponse } from 'next/server'

let wss: WebSocketServer

function initWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws) => {
      console.log('Client connected')

      ws.on('message', (data) => {
        try {
          // Broadcast to all clients
          const message = data.toString()
          wss.clients.forEach((client) => {
            if (client !== ws) {
              client.send(message)
            }
          })
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      })

      ws.on('close', () => {
        console.log('Client disconnected')
      })
    })
  }
  return wss
}

export function GET() {
  // This route will be used for the WebSocket upgrade
  return new NextResponse(null, {
    status: 426,
    headers: {
      'Upgrade': 'websocket',
    },
  })
}

// Export the WebSocket server initialization for middleware
export const wsServer = initWebSocketServer()
