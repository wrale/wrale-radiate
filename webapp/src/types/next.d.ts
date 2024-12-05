import { Server as NetServer, Socket } from 'net'
import { Server as SocketIOServer } from 'socket.io'

declare module 'next' {
  export interface Server extends NetServer {
    io?: SocketIOServer
  }
}

declare module 'http' {
  interface ServerResponse {
    socket: Socket & {
      server: Server
    }
  }
}
