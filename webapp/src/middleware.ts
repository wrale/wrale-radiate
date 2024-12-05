import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle WebSocket upgrade for our endpoint
  if (pathname === '/api/ws') {
    const upgrade = request.headers.get('upgrade')
    if (upgrade?.toLowerCase() === 'websocket') {
      return NextResponse.next()
    }
    return NextResponse.json({ error: 'Expected WebSocket connection' }, { status: 426 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/ws'
}
