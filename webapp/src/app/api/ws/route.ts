import { Server } from 'ws'
import { NextResponse } from 'next/server'

let wsServer: Server

if (!(global as any).wsServer) {
  (global as any).wsServer = new Server({ port: 3001 })
  wsServer = (global as any).wsServer

  wsServer.on('connection', (socket) => {
    console.log('Display connected')

    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        if (message.type === 'health') {
          // Store health data or emit to monitoring
          console.log('Health update:', message)
        }
      } catch (err) {
        console.error('Error processing message:', err)
      }
    })

    socket.on('close', () => {
      console.log('Display disconnected')
    })
  })
} else {
  wsServer = (global as any).wsServer
}

export async function GET() {
  return new NextResponse('WebSocket server running')
}
