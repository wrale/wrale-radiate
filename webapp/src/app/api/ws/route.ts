import { WebSocket } from 'ws'

// Mark this route as using the Edge Runtime
export const runtime = 'edge'

// Store connected clients
const clients = new Set<WebSocket>()

export async function GET(request: Request) {
  const { socket, response } = Reflect.get(request, 'socket')
  
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected Websocket', { status: 426 })
  }

  try {
    const webSocket = await new Promise<WebSocket>((resolve, reject) => {
      const wss = new WebSocket.Server({ noServer: true })
      
      wss.once('connection', (ws) => {
        clients.add(ws)
        resolve(ws)
      })

      wss.once('error', reject)

      wss.handleUpgrade(request as any, socket, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws)
      })
    })

    webSocket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString())
        console.log('Received message:', message)

        // Broadcast to all other clients
        clients.forEach((client) => {
          if (client !== webSocket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
          }
        })
      } catch (error) {
        console.error('Error processing message:', error)
      }
    })

    webSocket.on('close', () => {
      console.log('Client disconnected')
      clients.delete(webSocket)
    })

    return response
  } catch (error) {
    console.error('WebSocket error:', error)
    return new Response('WebSocket error', { status: 500 })
  }
}

// Helper function to broadcast to all clients
export function broadcast(message: any) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}
