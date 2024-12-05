import { WebSocketServer } from 'ws'
import type { CustomWebSocket, WebSocketMessage } from './types'

let wss: WebSocketServer | null = null

export function getWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws: CustomWebSocket) => {
      console.log('Client connected')

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString())
          // Broadcast to all clients
          wss?.clients.forEach((client: CustomWebSocket) => {
            if (client !== ws) {
              client.send(JSON.stringify(message))
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
