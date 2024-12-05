"use client"

import { useEffect, useRef, useState } from 'react'

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'connecting' | 'ready' | 'playing'>('connecting')

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_MGMT_SERVER
    if (!wsUrl) {
      console.error('Management server URL not configured')
      return
    }

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setStatus('ready')
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
        if (msg.type === 'play' && videoRef.current) {
          videoRef.current.src = msg.url
          videoRef.current.play()
          setStatus('playing')
        }
      } catch (err) {
        console.error('Error processing message:', err)
      }
    }

    const interval = setInterval(() => {
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
      clearInterval(interval)
      ws.close()
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
            {status === 'connecting' ? 'Connecting...' : 'Ready for content'}
          </span>
        </div>
      )}
    </div>
  )
}
