import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const requestOrigin = request.headers.get('origin')
  const origin = requestOrigin || '*'
  
  // Create base response
  const response = NextResponse.next()

  // Add standard CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
  response.headers.set('Access-Control-Allow-Headers', '*')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers
    })
  }

  return response
}

// Configure middleware to run only for Socket.IO path
export const config = {
  matcher: '/api/socket/:path*',
}
