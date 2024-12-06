export interface HealthUpdate {
  type: 'health'
  displayId: string
  status: 'playing' | 'ready' | 'error'
  contentId?: string
  error?: string
  timestamp?: number
}

export interface PlayCommand {
  type: 'play'
  url: string
  contentId: string
}

export type WebSocketMessage = HealthUpdate | PlayCommand
