import { Server as NetServer, Socket } from 'net'
import { Server as SocketIOServer } from 'socket.io'
import { WebSocketServer } from 'ws'

declare module 'next' {
  export interface Server extends NetServer {
    io?: SocketIOServer;
    ws?: WebSocketServer;
  }
}

declare module 'http' {
  interface ServerResponse {
    socket: Socket & {
      server: Server
    }
  }
}
