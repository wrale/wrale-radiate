import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import type { Server as NetServer } from 'http'
import type { Socket } from 'socket.io'
import { IncomingMessage } from 'http'
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

interface ExtendedIncomingMessage extends IncomingMessage {
  _query?: Record<string, string>;
}

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  try {
    if (!res.socket.server.io) {
      console.log('Creating Socket.IO server...')

      const io = new SocketIOServer(res.socket.server)

      // Set up Socket.IO event handlers
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

      // Configure Socket.IO
      io.engine.on('initial_headers', (headers: any, req: any) => {
        console.log('Setting initial headers for:', req.url)
      })

      io.engine.on('headers', (headers: any, req: any) => {
        console.log('Setting headers for:', req.url)
      })

      io.engine.on('connection_error', (err) => {
        console.error('Connection error:', err)
      })

      // Store the io instance
      res.socket.server.io = io
    } else {
      console.log('Socket.IO server already running')
    }

    res.end()
  } catch (err) {
    console.error('Error in Socket.IO handler:', err)
    res.status(500).end()
  }
}

export default ioHandler
