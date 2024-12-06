import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
