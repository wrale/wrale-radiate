import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer } from 'http'
import type { Socket } from 'socket.io'

export const config = {
  api: {
    bodyParser: false
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
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['polling', 'websocket']
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
    })

    res.socket.server.io = io
  } else {
    console.log('Socket.IO already running')
  }
  res.end()
}

export default ioHandler