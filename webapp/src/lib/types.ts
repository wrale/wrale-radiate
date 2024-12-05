import type { WebSocket } from 'ws'

export interface DisplayHealthMessage {
  type: 'health'
  status: 'connecting' | 'ready' | 'playing'
  displayId: string
  currentTime?: number
  duration?: number
}

export interface PlayMessage {
  type: 'play'
  url: string
}

export type WebSocketMessage = DisplayHealthMessage | PlayMessage

// Keep CustomWebSocket for ws package compatibility
export interface CustomWebSocket extends WebSocket {
  send(data: string | Buffer): void
}