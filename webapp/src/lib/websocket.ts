import { WebSocketServer } from 'ws'

let wss: WebSocketServer | null = null

export function getWebSocketServer() {
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
