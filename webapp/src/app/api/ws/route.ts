import { headers } from 'next/headers'
import type { WebSocketMessage } from '@/lib/types'

export const runtime = 'edge'

export async function GET(request: Request) {
  const headersList = headers()
  const upgradeHeader = headersList.get('upgrade')

  if (!upgradeHeader?.toLowerCase()?.includes('websocket')) {
    return new Response('Expected WebSocket', { status: 426 })
  }

  try {
    const webSocketUrl = new URL(request.url)
    const clientId = webSocketUrl.searchParams.get('clientId') || 'unknown'

    const { socket } = Reflect.get(request, 'socket')
    const wsKey = headersList.get('sec-websocket-key')
    const wsProtocol = headersList.get('sec-websocket-protocol')

    const responseHeaders = new Headers()
    responseHeaders.set('Upgrade', 'websocket')
    responseHeaders.set('Connection', 'Upgrade')
    if (wsKey) responseHeaders.set('Sec-WebSocket-Accept', wsKey)
    if (wsProtocol) responseHeaders.set('Sec-WebSocket-Protocol', wsProtocol)

    socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage
        console.log(`Message from ${clientId}:`, message)
        
        if (message.type === 'health') {
          // Store or process health update
          console.log(`Health update from ${clientId}:`, message)
        }
      } catch (error) {
        console.error('Error processing message:', error)
      }
    })

    socket.on('close', () => {
      console.log(`Client ${clientId} disconnected`)
    })

    return new Response(null, {
      status: 101,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error('WebSocket setup error:', err)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}
