class WebSocketServer {
  private static instance: WebSocketServer
  private clients: Set<WebSocket>

  private constructor() {
    this.clients = new Set()
  }

  public static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer()
    }
    return WebSocketServer.instance
  }

  public async handleUpgrade(request: Request, socket: any) {
    try {
      const webSocket = await new Promise<WebSocket>((resolve, reject) => {
        const ws = new WebSocket(request.url)
        
        ws.onopen = () => resolve(ws)
        ws.onerror = reject
      })

      this.clients.add(webSocket)

      webSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('Received message:', message)

          // Broadcast to all other clients
          this.clients.forEach((client) => {
            if (client !== webSocket && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message))
            }
          })
        } catch (error) {
          console.error('Error processing message:', error)
        }
      }

      webSocket.onclose = () => {
        console.log('Client disconnected')
        this.clients.delete(webSocket)
      }

    } catch (error) {
      console.error('WebSocket connection error:', error)
      throw error
    }
  }

  public broadcast(message: any) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }
}

export { WebSocketServer }
