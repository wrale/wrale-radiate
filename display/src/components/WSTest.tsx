"use client"

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function WSTest() {
  const [status, setStatus] = useState('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // Setup Socket.IO connection
    const socket = io('http://localhost:3000', {
      path: '/api/socketio',
      addTrailingSlash: false
    })

    socket.on('connect', () => {
      setStatus('Connected')
      setMessages(prev => [...prev, 'Connected to server'])
    })

    socket.on('message', (message) => {
      setMessages(prev => [...prev, `Received: ${message}`])
    })

    socket.on('disconnect', () => {
      setStatus('Disconnected')
    })

    socket.on('connect_error', (error) => {
      setStatus(`Connection error: ${error.message}`)
      console.error('Socket.IO connection error:', error)
    })

    const sendTestMessage = () => {
      const msg = `Test message at ${new Date().toISOString()}`
      socket.emit('message', msg)
      setMessages(prev => [...prev, `Sent: ${msg}`])
    }

    // Return cleanup function
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      <div className="mb-4">
        <button
          onClick={() => {
            const msg = `Test message at ${new Date().toISOString()}`
            setMessages(prev => [...prev, `Sent: ${msg}`])
          }}
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
