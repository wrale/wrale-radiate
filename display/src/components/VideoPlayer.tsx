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

    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_MGMT_SERVER
      if (!wsUrl) {
        setError('Management server URL not configured')
        setStatus('error')
        return
      }

      try {
        console.log('Attempting to connect to:', wsUrl)
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
            displayId: 'display-1'
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
              console.log('Connection acknowledged by server')
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
          // Schedule retry
          retryTimeout = setTimeout(connectWebSocket, RETRY_INTERVAL)
        }

        // Start health reporting interval
        const healthInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'health',
              status,
              displayId: 'display-1',
              currentTime: videoRef.current?.currentTime,
              duration: videoRef.current?.duration
            }))
          }
        }, 5000)

        return () => {
          clearInterval(healthInterval)
          ws.close()
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
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <span className="text-xl">
            {status === 'connecting' && 'Connecting...'}
            {status === 'ready' && 'Ready for content'}
            {status === 'error' && `Error: ${error}`}
          </span>
        </div>
      )}
    </div>
  )
}
