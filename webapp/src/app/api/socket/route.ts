import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ 
    notice: 'WebSocket endpoint moved to /api/ws',
    status: 'deprecated'
  }, { status: 301 });
}
