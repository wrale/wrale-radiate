import type { WebSocket } from 'ws'

export interface WebSocketMessage {
  type: 'play' | 'status'
  url?: string
  id?: string
  status?: 'online' | 'offline'
}

export interface CustomWebSocket extends WebSocket {
  send(data: string | Buffer): void
}
