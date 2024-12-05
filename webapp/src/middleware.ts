import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { wsServer } from './app/api/ws/route'

export function middleware(request: NextRequest) {
  if (request.headers.get('upgrade') === 'websocket') {
    // Handle WebSocket upgrade
    const res = new NextResponse()
    res.headers.set('upgrade', 'websocket')
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/ws',
}
