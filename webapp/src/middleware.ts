import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { WebSocketServer } from 'ws'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/ws') {
    const upgradeHeader = request.headers.get('upgrade')
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      // Get the WebSocket server instance from the response
      const res = NextResponse.next()
      const wss = (res as any).socket as WebSocketServer

      if (wss) {
        // Handle the upgrade here
        wss.handleUpgrade(request as any, request.socket as any, Buffer.alloc(0), (ws) => {
          wss.emit('connection', ws)
        })
      }

      return res
    }
    return new NextResponse(null, { status: 400 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/ws'
}
