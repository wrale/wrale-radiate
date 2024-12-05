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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
]

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Set CORS headers
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader('Access-Control-Allow-Headers', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO...')
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['*']
      },
      connectTimeout: 45000,
      pingTimeout: 30000,
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