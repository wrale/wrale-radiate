"use client"

import { useEffect, useState } from 'react'

export function WSTest() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // Use window.location to get the current hostname and port
    const wsUrl = `ws://${window.location.hostname}:3000/api/ws`
    console.log('Connecting to WebSocket:', wsUrl)

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
      setStatus('Error: ' + error.toString())
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      setStatus('Disconnected')
    }

    return () => {
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
