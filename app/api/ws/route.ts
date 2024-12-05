import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

if (!process.env.EDGE_RUNTIME) {
  throw new Error('This route requires edge runtime')
}

export async function GET(req: NextRequest) {
  const { socket, response } = await WebSocket.accept(req)

  socket.onopen = () => {
    console.log('WebSocket connection opened')
  }

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('Received message:', data)
      
      // Echo back for now
      socket.send(JSON.stringify({ 
        type: 'ACK',
        data: data 
      }))
    } catch (err) {
      console.error('Error handling message:', err)
    }
  }

  socket.onclose = () => {
    console.log('WebSocket connection closed')
  }

  return response
}
