import { WebSocketServer } from 'ws'
import { NextResponse } from 'next/server'

let wss: WebSocketServer | null = null

export function GET(request: Request) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws) => {
      console.log('Client connected')
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          wss?.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
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

  // This is required for WebSocket upgrade
  return new NextResponse(null, {
    status: 101,
    headers: {
      Upgrade: 'websocket',
      Connection: 'Upgrade',
    },
  })
}
