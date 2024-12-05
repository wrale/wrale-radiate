import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextResponse } from 'next/server'

export function GET(req: Request, { params }: { params: Record<string, string> }) {
  try {
    // @ts-ignore
    if (!global.io) {
      console.log('Creating Socket.IO server')
      const netServer = req.socket.server as unknown as NetServer
      // @ts-ignore
      global.io = new SocketIOServer(netServer, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      // @ts-ignore
      global.io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('message', (message) => {
          console.log('Message received:', message)
          socket.broadcast.emit('message', message)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Socket.IO initialization error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
