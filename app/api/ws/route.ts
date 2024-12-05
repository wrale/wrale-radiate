import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type DisplayStatus = {
  id: string
  healthy: boolean
  lastUpdate: string
  playbackStatus?: string
}

type Message = {
  type: 'status' | 'heartbeat'
  data: DisplayStatus
}

export async function GET(req: NextRequest) {
  const { socket, response } = await WebSocket.accept(req)

  socket.onopen = () => {
    console.log('Display connected')
    socket.send(JSON.stringify({ type: 'welcome' }))
  }

  socket.onmessage = async (event) => {
    try {
      const message: Message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'status':
          // Store status update
          console.log('Status update:', message.data)
          socket.send(JSON.stringify({ 
            type: 'ack',
            data: { received: message.data.lastUpdate }
          }))
          break

        case 'heartbeat':
          socket.send(JSON.stringify({ type: 'heartbeat' }))
          break

        default:
          console.warn('Unknown message type:', message)
      }
    } catch (err) {
      console.error('Error handling message:', err)
    }
  }

  socket.onclose = () => {
    console.log('Display disconnected')
  }

  return response
}
