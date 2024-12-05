"use client"

import { useEffect, useState } from 'react'

export function WSTest() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // Get the correct server URL based on environment
    const serverPort = process.env.NEXT_PUBLIC_SERVER_PORT || '3000'
    const wsUrl = `ws://${window.location.hostname}:${serverPort}/api/ws`
    console.log('Connecting to WebSocket:', wsUrl)

    let reconnectTimer: NodeJS.Timeout
    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setStatus('Connected')
        ws.send('Hello from client!')
      }

      ws.onmessage = (event) => {
        console.log('Message received:', event.data)
        setMessages(prev => [...prev, event.data])
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('Error: Connection failed')
      }

      ws.onclose = () => {
        console.log('WebSocket closed')
        setStatus('Disconnected - Retrying...')
        // Try to reconnect after 2 seconds
        reconnectTimer = setTimeout(connectWebSocket, 2000)
      }

      return ws
    }

    const ws = connectWebSocket()

    return () => {
      clearTimeout(reconnectTimer)
      ws.close()
    }
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      <div>
        <strong>Messages:</strong>
        <ul className="list-disc pl-4">
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
