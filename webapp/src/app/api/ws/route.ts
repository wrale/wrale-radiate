import { WebSocketServer } from '@/lib/websocket'

// Use Edge Runtime
export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    if (!process.env.NEXT_EDGE_WEB_SOCKET) {
      return new Response('WebSocket not enabled', { status: 500 })
    }

    if (!request.headers.get('upgrade')?.includes('websocket')) {
      return new Response('Expected WebSocket upgrade', { status: 426 })
    }

    const { socket, response } = Reflect.get(request, 'socket')

    // Get the singleton WebSocket server
    const wss = WebSocketServer.getInstance()

    await wss.handleUpgrade(request, socket)

    return response
  } catch (error) {
    console.error('WebSocket setup error:', error)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}
