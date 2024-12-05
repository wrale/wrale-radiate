import { NextRequest } from 'next/server'
import type { WebSocketMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { socket, response } = await WebSocket.accept(req)

  socket.onopen = () => {
    console.log('Display connected')
  }

  socket.onmessage = async (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      // Log and broadcast health updates
      if (message.type === 'health') {
        console.log(`Display ${message.displayId}: ${message.status}`)
        // Broadcast to other management UI clients
      }

      socket.send(JSON.stringify({ type: 'ack' }))
    } catch (err) {
      console.error('Error handling message:', err)
    }
  }

  socket.onclose = () => {
    console.log('Display disconnected')
  }

  return response
}
