"use client"

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function WSTest() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const socketUrl = `http://${window.location.hostname}:3000`
    console.log('Connecting to socket server:', socketUrl)

    const socketIo = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10
    })

    socketIo.on('connect', () => {
      console.log('Socket connected:', socketIo.id)
      setStatus('Connected')
    })

    socketIo.on('welcome', (msg) => {
      console.log('Welcome message:', msg)
      setMessages(prev => [...prev, `Server: ${msg}`])
    })

    socketIo.on('message', (msg) => {
      console.log('Message received:', msg)
      setMessages(prev => [...prev, `Received: ${msg}`])
    })

    socketIo.on('disconnect', () => {
      console.log('Socket disconnected')
      setStatus('Disconnected - Waiting for reconnection...')
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

  const sendTestMessage = () => {
    if (socket?.connected) {
      const msg = `Test message at ${new Date().toISOString()}`
      socket.emit('message', msg)
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
          onClick={sendTestMessage}
          disabled={!socket?.connected}
          className="px-4 py-2 text-white bg-blue-500 rounded disabled:bg-gray-300"
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
