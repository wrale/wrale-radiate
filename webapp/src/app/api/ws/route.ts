import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const headersList = headers()
  const upgrade = headersList.get('upgrade')
  
  if (upgrade?.toLowerCase() !== 'websocket') {
    return new NextResponse('Expected Websocket connection', { status: 426 })
  }

  try {
    // @ts-ignore - Next.js provides these in Edge Runtime
    const webSocketServer = new WebSocketServer({
      noServer: true
    })

    webSocketServer.on('connection', (ws) => {
      console.log('Display connected')

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          console.log('Message received:', message)
          
          if (message.type === 'health') {
            console.log(`Display ${message.displayId}: ${message.status}`)
            ws.send(JSON.stringify({ type: 'ack' }))
          }
        } catch (err) {
          console.error('Error handling message:', err)
          ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }))
        }
      })

      ws.on('close', () => {
        console.log('Display disconnected')
      })
    })

    const response = new NextResponse()
    // @ts-ignore - Next.js WebSocket handling
    response.socket = await webSocketServer.handleUpgrade(req)
    return response
  } catch (err) {
    console.error('WebSocket setup failed:', err)
    return new NextResponse('WebSocket setup failed', { status: 500 })
  }
}