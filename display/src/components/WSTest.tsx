"use client"

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function WSTest() {
  const [socket, setSocket] = useState<any>(null)
  const [status, setStatus] = useState('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // Setup Socket.IO connection
    const socketIo = io('http://localhost:3000', {
      path: '/api/socketio',
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    })

    socketIo.on('connect', () => {
      console.log('Connected to Socket.IO')
      setStatus('Connected')
      setMessages(prev => [...prev, 'Connected to server'])
    })

    socketIo.on('message', (message) => {
      console.log('Received message:', message)
      setMessages(prev => [...prev, `Received: ${message}`])
    })

    socketIo.on('disconnect', (reason) => {
      console.log('Disconnected:', reason)
      setStatus(`Disconnected: ${reason}`)
    })

    socketIo.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setStatus(`Connection error: ${error.message}`)
    })

    setSocket(socketIo)

    return () => {
      socketIo.disconnect()
    }
  }, [])

  const sendMessage = () => {
    if (socket?.connected) {
      const msg = `Test message at ${new Date().toISOString()}`
      socket.emit('message', msg)
      setMessages(prev => [...prev, `Sent: ${msg}`])
    } else {
      setMessages(prev => [...prev, 'Cannot send - not connected'])
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
          disabled={!socket?.connected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send Test Message
        </button>
      </div>
      <div>
        <strong>Messages:</strong>
        <ul className="list-disc pl-4 mt-2 space-y-1 max-h-60 overflow-y-auto">
          {messages.map((msg, i) => (
            <li key={i} className="text-sm">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
