import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getWebSocketServer } from '@/lib/websocket'

export function middleware(request: NextRequest) {
  if (request.headers.get('upgrade') === 'websocket') {
    const wss = getWebSocketServer()
    if (wss) {
      // Return response indicating WebSocket upgrade is available
      const res = new NextResponse()
      res.headers.set('upgrade', 'websocket')
      return res
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/ws',
}
