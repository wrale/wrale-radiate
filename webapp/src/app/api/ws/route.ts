// This file is deprecated - using Socket.IO instead
export async function GET() {
  return new Response('WebSocket endpoint moved to /api/socket', { status: 410 });
}
