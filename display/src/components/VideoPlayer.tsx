"use client"

import { useEffect, useRef, useState } from 'react'

const RETRY_INTERVAL = 5000 // 5 seconds between retries

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<'connecting' | 'ready' | 'playing' | 'error'>('connecting')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout
    const clientId = `display-${Math.random().toString(36).substring(7)}`

    const connectWebSocket = () => {
      const wsBaseUrl = process.env.NEXT_PUBLIC_MGMT_SERVER
      if (!wsBaseUrl) {
        setError('Management server URL not configured')
        setStatus('error')
        return
      }

      try {
        // Update URL to use page route instead of app route
        const wsUrl = wsBaseUrl.replace('/api/ws', '/api/ws')
        console.log('Attempting to connect to:', wsUrl)

        if (wsRef.current) {
          wsRef.current.close()
        }

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setStatus('ready')
          setError('')
          // Send initial health report
          ws.send(JSON.stringify({
            type: 'health',
            status: 'ready',
            displayId: clientId
          }))
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            console.log('Received message:', msg)
            if (msg.type === 'play' && videoRef.current) {
              videoRef.current.src = msg.url
              videoRef.current.play()
              setStatus('playing')
            } else if (msg.type === 'connected') {
              console.log('Connection acknowledged')
            }
          } catch (err) {
            console.error('Error processing message:', err)
          }
        }

        ws.onerror = (event) => {
          console.error('WebSocket error:', event)
          setError('Connection error')
          setStatus('error')
        }

        ws.onclose = () => {
          console.log('WebSocket closed, scheduling retry...')
          setStatus('connecting')
          wsRef.current = null
          // Schedule retry
          retryTimeout = setTimeout(connectWebSocket, RETRY_INTERVAL)
        }

        // Start health reporting interval
        const healthInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'health',
              status,
              displayId: clientId,
              currentTime: videoRef.current?.currentTime,
              duration: videoRef.current?.duration
            }))
          }
        }, 5000)

        return () => {
          clearInterval(healthInterval)
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close()
          }
        }
      } catch (err) {
        console.error('Error setting up WebSocket:', err)
        setError('Failed to connect')
        setStatus('error')
        // Schedule retry
        retryTimeout = setTimeout(connectWebSocket, RETRY_INTERVAL)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearTimeout(retryTimeout)
    }
  }, [])

  return (
    <div className="relative h-screen">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
      />
      
      {status !== 'playing' && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
          <span className="text-xl font-semibold">
            {status === 'connecting' && 'Connecting...'}
            {status === 'ready' && 'Ready for content'}
            {status === 'error' && `Error: ${error}`}
          </span>
        </div>
      )}
    </div>
  )
}
