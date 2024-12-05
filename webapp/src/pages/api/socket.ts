import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer } from 'http'
import type { Socket } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
}

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO...')
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: false, // Let middleware handle CORS
      transports: ['polling', 'websocket'],
      connectTimeout: 45000,
      pingTimeout: 30000
    })

    io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id)

      socket.on('health', (data) => {
        console.log('Health update from', socket.id, ':', data)
      })

      socket.emit('connected', { id: socket.id })

      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, reason)
      })

      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    })

    io.engine.on('connection_error', (err) => {
      console.error('Connection error:', err)
    })

    res.socket.server.io = io
  } else {
    console.log('Socket.IO already running')
  }
  res.end()
}

export default ioHandler