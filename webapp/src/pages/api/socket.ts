import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { getSocketIO, config as socketConfig } from '@/lib/socket'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket?.server?.io) {
    const httpServer: NetServer = res.socket.server as any
    res.socket.server.io = getSocketIO()
    res.socket.server.io.attach(httpServer)
    console.log('[Socket.IO] Server initialized')
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}