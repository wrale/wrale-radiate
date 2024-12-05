import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { WebSocketServer } from 'ws'
import type { CustomWebSocket, WebSocketMessage } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const upgradeHeader = headers().get('upgrade')
  if (upgradeHeader?.toLowerCase() !== 'websocket') {
    return new NextResponse('Expected WebSocket connection', { status: 426 })
  }

  try {
    const wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws: CustomWebSocket) => {
      console.log('Display connected')

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage
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

    // Handle the upgrade
    const { socket, response } = await WebSocket.accept(request)
    await new Promise<void>((resolve, reject) => {
      wss.handleUpgrade(request as any, socket as any, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws)
        resolve()
      })
    })

    return response
  } catch (err) {
    console.error('WebSocket setup failed:', err)
    return new NextResponse('WebSocket setup failed', { status: 500 })
  }
}