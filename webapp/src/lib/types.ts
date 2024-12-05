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
