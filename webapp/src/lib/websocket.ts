import { WebSocketServer } from 'ws'

declare global {
  var wsServer: WebSocketServer
}

export function initWebSocket(server: any) {
  if (!global.wsServer) {
    global.wsServer = new WebSocketServer({ server })
    
    global.wsServer.on('connection', (ws) => {
      console.log('Display connected')

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          if (message.type === 'status') {
            // Broadcast status to all clients
            global.wsServer.clients.forEach((client) => {
              if (client !== ws) {
                client.send(data.toString())
              }
            })
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      })

      ws.on('close', () => {
        console.log('Display disconnected')
      })
    })
  }
  
  return global.wsServer
}
