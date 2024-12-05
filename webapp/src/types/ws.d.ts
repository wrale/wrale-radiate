declare module 'ws' {
  import { EventEmitter } from 'events'
  import { IncomingMessage } from 'http'
  import { Duplex } from 'stream'

  class WebSocket extends EventEmitter {
    static CONNECTING: number
    static OPEN: number
    static CLOSING: number
    static CLOSED: number

    constructor(address: string, protocols?: string | string[])
    readyState: number
    send(data: any): void
    close(): void
  }

  namespace WebSocket {
    class Server extends EventEmitter {
      constructor(options: { noServer: boolean })
      handleUpgrade(
        request: any,
        socket: any,
        head: Buffer,
        callback: (client: WebSocket) => void
      ): void
      on(event: string, listener: (...args: any[]) => void): this
      once(event: string, listener: (...args: any[]) => void): this
      emit(event: string, ...args: any[]): boolean
    }
  }

  export = WebSocket
}
