"use client"

import { useEffect, useState, useCallback } from 'react'

export function WSTest() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [status, setStatus] = useState('Initializing...')
  const [messages, setMessages] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  const connect = useCallback(() => {
    if (retryCount >= maxRetries) {
      setStatus(`Max retries (${maxRetries}) reached. Please refresh.`)
      return
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.hostname}:3000/api/socketio`
      console.log(`Connecting to WebSocket (attempt ${retryCount + 1}):`, wsUrl)

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setStatus('Connected')
        setRetryCount(0)

        // Send initial message
        ws.send(JSON.stringify({
          type: 'message',
          message: 'Client connected'
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received:', data)
          if (data.type === 'welcome') {
            setMessages(prev => [...prev, `Server: ${data.message}`])
          } else if (data.type === 'broadcast') {
            setMessages(prev => [...prev, `Broadcast: ${data.message}`])
          } else {
            setMessages(prev => [...prev, `Message: ${data.message}`])
          }
        } catch (err) {
          console.error('Error parsing message:', err)
          setMessages(prev => [...prev, `Raw message: ${event.data}`])
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('Connection error occurred')
      }

      ws.onclose = () => {
        console.log('WebSocket closed')
        setStatus('Disconnected - Retrying...')
        setSocket(null)

        // Increment retry count and try again with exponential backoff
        setRetryCount(prev => prev + 1)
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        setTimeout(connect, delay)
      }

      setSocket(ws)
    } catch (error) {
      console.error('Connection setup error:', error)
      setStatus('Failed to setup connection')
    }
  }, [retryCount])

  useEffect(() => {
    connect()
    return () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [connect])

  const sendMessage = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        message: `Test message at ${new Date().toISOString()}`
      }
      socket.send(JSON.stringify(message))
      setMessages(prev => [...prev, `Sent: ${message.message}`])
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
        {retryCount > 0 && ` (Attempt ${retryCount}/${maxRetries})`}
      </div>
      
      <div className="mb-4">
        <button
          onClick={sendMessage}
          disabled={!socket || socket.readyState !== WebSocket.OPEN}
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
