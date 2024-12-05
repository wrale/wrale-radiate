import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer } from 'http'
import type { Socket } from 'socket.io'
import { parse } from 'url'

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

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Creating Socket.IO server...')

    const io = new SocketIOServer({
      path: '/api/socket',
      addTrailingSlash: false,
      transports: ['websocket'],
      cors: {
        origin: '*',
      },
    })

    // Handle WebSocket upgrades
    const server = res.socket.server
    server.on('upgrade', (request, socket, head) => {
      const pathname = parse(request.url || '').pathname || ''
      
      if (pathname.startsWith('/api/socket')) {
        console.log('Handling WebSocket upgrade for:', pathname)
        io.engine.handleUpgrade(request, socket, head)
      } else {
        socket.destroy()
      }
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

    io.engine.on('initial_headers', (headers: any, req: any) => {
      console.log('Setting initial headers for:', req.url)
    })

    io.engine.on('headers', (headers: any, req: any) => {
      console.log('Setting headers for:', req.url)
    })

    io.engine.on('connection_error', (err) => {
      console.error('Connection error:', err)
    })

    res.socket.server.io = io
  } else {
    console.log('Socket.IO server already running')
  }

  res.end()
}

export default ioHandler
