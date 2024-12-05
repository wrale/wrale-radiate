import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { getSocketIO } from '@/lib/socket'

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

interface ResponseWithSocket extends NextApiResponse {
  socket: any
}

export default function handler(req: NextApiRequest, res: ResponseWithSocket) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server as SocketServer
    httpServer.io = getSocketIO()
    httpServer.io.attach(httpServer)
    console.log('[Socket.IO] Server initialized')
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}