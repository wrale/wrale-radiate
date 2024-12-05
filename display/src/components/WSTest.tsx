"use client"

import { useEffect, useState, useCallback } from 'react'

export function WSTest() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.hostname}:3000/api/ws`
    console.log('Connecting to:', wsUrl)

    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('Connected')
      setStatus('Connected')
      socket.send('Hello from display client')
    }

    socket.onmessage = (event) => {
      console.log('Message:', event.data)
      setMessages(prev => [...prev, event.data])
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatus('Error occurred')
    }

    socket.onclose = () => {
      console.log('Connection closed')
      setStatus('Disconnected')
      setWs(null)
      // Try to reconnect after 2 seconds
      setTimeout(connect, 2000)
    }

    setWs(socket)
  }, [])

  useEffect(() => {
    connect()
    return () => ws?.close()
  }, [connect])

  const sendMessage = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      const msg = `Test message at ${new Date().toISOString()}`
      ws.send(msg)
      setMessages(prev => [...prev, `Sent: ${msg}`])
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      <div className="mb-4">
        <button
          onClick={sendMessage}
          disabled={!ws || ws.readyState !== WebSocket.OPEN}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send Test Message
        </button>
      </div>
      <div>
        <strong>Messages:</strong>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
