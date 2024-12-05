"use client"

import { useEffect, useState, useCallback } from 'react'

export function WSTest() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])
  const [retries, setRetries] = useState(0)
  const maxRetries = 5

  const connect = useCallback(() => {
    if (retries >= maxRetries) {
      setStatus('Max retries reached. Please refresh the page.')
      return
    }

    try {
      const baseUrl = window.location.hostname
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//${baseUrl}:3000/ws`

      console.log(`Connecting to WebSocket (attempt ${retries + 1}):`, wsUrl)
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('WebSocket connected')
        setStatus('Connected')
        setRetries(0)
        socket.send(JSON.stringify({
          type: 'message',
          message: 'Hello from display client!'
        }))
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received:', data)
          setMessages(prev => [...prev, `${data.type}: ${data.message}`])
        } catch (err) {
          console.error('Error parsing message:', err)
          setMessages(prev => [...prev, `Raw message: ${event.data}`])
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('Connection error occurred')
      }

      socket.onclose = () => {
        console.log('WebSocket closed')
        setStatus('Disconnected - Retrying...')
        setWs(null)
        // Increment retry count and try again after delay
        setRetries(prev => prev + 1)
        setTimeout(connect, Math.min(1000 * Math.pow(2, retries), 10000))
      }

      setWs(socket)
    } catch (error) {
      console.error('Connection setup error:', error)
      setStatus('Failed to setup connection')
    }
  }, [retries])

  useEffect(() => {
    connect()
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [connect, ws])

  const sendMessage = () => {
    if (ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        message: `Test message at ${new Date().toISOString()}`
      }
      ws.send(JSON.stringify(message))
      setMessages(prev => [...prev, `Sent: ${message.message}`])
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
        {retries > 0 && ` (Attempt ${retries}/${maxRetries})`}
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
        <ul className="list-disc pl-4 mt-2 space-y-1 max-h-60 overflow-y-auto">
          {messages.map((msg, i) => (
            <li key={i} className="text-sm">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
