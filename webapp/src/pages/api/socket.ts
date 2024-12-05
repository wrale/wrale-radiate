import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer } from 'http'
import type { Socket } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
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
      transports: ['websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false,
      },
    })

    io.on('connection', (socket: Socket) => {
      const clientId = socket.id
      console.log('Client connected:', clientId)

      socket.on('health', (data) => {
        console.log('Health update from', clientId, ':', data)
      })

      socket.emit('connected', { id: clientId })

      socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', clientId, reason)
      })

      socket.on('error', (error) => {
        console.error('Socket error from', clientId, ':', error)
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
