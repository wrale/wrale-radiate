import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const headersList = headers()
  const upgrade = headersList.get('upgrade')

  if (!upgrade || upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected Websocket', { status: 426 })
  }

  try {
    const webSocketUrl = new URL(request.url)
    const clientId = webSocketUrl.searchParams.get('clientId') || 'unknown'

    // Create a Response that indicates this should upgrade to WebSocket
    const responseHeaders = {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': headersList.get('sec-websocket-key') || '',
      'Sec-WebSocket-Protocol': headersList.get('sec-websocket-protocol') || ''
    }

    console.log(`WebSocket connection attempt from ${clientId}`)

    return new Response(null, {
      status: 101,
      headers: responseHeaders
    })
  } catch (err) {
    console.error('WebSocket setup error:', err)
    return new Response('WebSocket setup failed', { status: 500 })
  }
}
