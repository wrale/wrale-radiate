import type { WebSocket, WebSocketServer } from 'ws'

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

export interface CustomWebSocket extends WebSocket {
  send(data: string | Buffer): void
}

export interface CustomWebSocketServer extends WebSocketServer {
  handleUpgrade(request: Request): Promise<WebSocket>
}
