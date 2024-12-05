import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { WebSocketServer } from 'ws'
import type { WebSocketMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check for WebSocket upgrade
  const upgradeHeader = headers().get('upgrade')
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 426 })
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(request)

    socket.onopen = () => {
      console.log('Display connected')
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        console.log('Message received:', message)
        
        if (message.type === 'health') {
          console.log(`Display ${message.displayId}: ${message.status}`)
          socket.send(JSON.stringify({ type: 'ack' }))
        }
      } catch (err) {
        console.error('Error handling message:', err)
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }))
      }
    }

    socket.onclose = () => {
      console.log('Display disconnected')
    }

    return response
  } catch (err) {
    console.error('WebSocket setup failed:', err)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}