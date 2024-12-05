import { Server as SocketIOServer } from 'socket.io'
import type { WebSocketMessage } from './types'

let io: SocketIOServer | null = null

export function getSocketIO() {
  if (!io) {
    io = new SocketIOServer({
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      connectTimeout: 60000
    })

    io.on('connection', (socket) => {
      console.log('[Socket.IO] Client connected:', socket.id)

      socket.on('health', (data) => {
        console.log('[Socket.IO] Health update from', socket.id, data)
      })

      socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Client disconnected:', socket.id, reason)
      })

      socket.on('error', (error) => {
        console.error('[Socket.IO] Error from', socket.id, error)
      })

      // Send initial connection acknowledgment
      socket.emit('connected', { id: socket.id })
    })

    io.on('error', (error) => {
      console.error('[Socket.IO] Server error:', error)
    })
  }
  return io
}

export function broadcast(message: WebSocketMessage) {
  if (io) {
    io.emit('message', message)
  }
}
