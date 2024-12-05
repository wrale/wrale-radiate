import { Server as SocketIOServer } from 'socket.io'
import type { WebSocketMessage } from './types'

export const config = {
  path: '/api/socket'
}

let io: SocketIOServer | null = null

export function getSocketIO() {
  if (!io) {
    io = new SocketIOServer({
      path: config.path,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling']
    })

    io.on('connection', (socket) => {
      console.log('[Socket.IO] Client connected:', socket.id)

      socket.on('health', (data) => {
        console.log('[Socket.IO] Health update from', socket.id, data)
      })

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Client disconnected:', socket.id)
      })

      // Send initial connection acknowledgment
      socket.emit('connected', { id: socket.id })
    })
  }
  return io
}

export function broadcast(message: WebSocketMessage) {
  if (io) {
    io.emit('message', message)
  }
}
