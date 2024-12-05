import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiHandler } from 'next'
import { NextResponse } from 'next/server'

let io: SocketIOServer

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    // Attach Socket.IO to the Next.js server instance
    const res = NextResponse.next()
    const server = (res as any)?.socket?.server

    if (server && !server.io) {
      console.log('Setting up Socket.IO server')
      server.io = new SocketIOServer(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      server.io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('message', (message) => {
          console.log('Message received:', message)
          // Broadcast to all except sender
          socket.broadcast.emit('message', message)
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })
    }
  }

  return new Response('Socket.IO endpoint', { status: 200 })
}

export const dynamic = 'force-dynamic'
