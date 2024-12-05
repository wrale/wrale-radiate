import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as HTTPServer } from 'http'
import { WebSocketServer } from 'ws'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket.server.ws) {
    console.log('Setting up WebSocket server...')
    
    // Set up WebSocket server
    const server = res.socket.server as HTTPServer
    const wss = new WebSocketServer({ noServer: true })

    wss.on('connection', function connection(ws) {
      console.log('Client connected')
      ws.send('Welcome!')

      ws.on('message', function incoming(message) {
        console.log('received: %s', message)
      })
    })

    server.on('upgrade', function upgrade(request, socket, head) {
      console.log('Upgrade request received')
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request)
      })
    })

    res.socket.server.ws = wss
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}
