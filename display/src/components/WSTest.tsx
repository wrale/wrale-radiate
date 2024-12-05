"use client"

import { useEffect, useState, useCallback } from 'react'

export function WSTest() {
  const [status, setStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)

  const connect = useCallback(() => {
    // Determine WebSocket URL based on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.hostname}:3000/api/ws`
    console.log('Connecting to WebSocket:', wsUrl)

    const ws = new WebSocket(wsUrl)

    ws.addEventListener('open', () => {
      console.log('WebSocket connected')
      setStatus('Connected')
      setRetryCount(0)
      ws.send('Hello from client!')
    })

    ws.addEventListener('message', (event) => {
      console.log('Message received:', event.data)
      setMessages(prev => [...prev, event.data])
    })

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
      setStatus('Error occurred')
    })

    ws.addEventListener('close', () => {
      console.log('WebSocket closed')
      setStatus('Disconnected - Retrying...')
      setRetryCount(prev => prev + 1)
      // Exponential backoff for reconnection
      const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000)
      setTimeout(() => connect(), timeout)
    })

    return ws
  }, [retryCount])

  useEffect(() => {
    const ws = connect()
    return () => {
      ws.close()
    }
  }, [connect])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket Test</h2>
      <div className="mb-4">
        <strong>Status:</strong> {status}
        {retryCount > 0 && ` (Attempt ${retryCount})`}
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
