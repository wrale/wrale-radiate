"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<'connecting' | 'ready' | 'playing' | 'error'>('connecting')
  const [error, setError] = useState<string>('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!serverUrl) {
      setError('Server URL not configured')
      setStatus('error')
      return
    }

    try {
      console.log('Connecting to server:', serverUrl)

      // Close existing connection if any
      if (socketRef.current?.connected) {
        socketRef.current.close()
      }

      const socket = io(serverUrl, {
        path: '/api/socket',
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        withCredentials: true,
        timeout: 45000
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Connected with ID:', socket.id)
        setStatus('ready')
        setError('')
        setRetryCount(0)
      })

      socket.on('message', (msg) => {
        try {
          console.log('Received message:', msg)
          if (msg.type === 'play' && videoRef.current) {
            videoRef.current.src = msg.url
            videoRef.current.play()
            setStatus('playing')
          }
        } catch (err) {
          console.error('Error processing message:', err)
        }
      })

      socket.on('connected', (data) => {
        console.log('Server acknowledged connection:', data)
      })

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err)
        setError(`Connection error: ${err.message}`)
        setStatus('error')
        setRetryCount((prev) => prev + 1)
      })

      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason)
        setStatus('connecting')
      })

      // Start health reporting interval
      const healthInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('health', {
            status,
            currentTime: videoRef.current?.currentTime,
            duration: videoRef.current?.duration
          })
        }
      }, 5000)

      // Set up automatic reconnection
      socket.io.on('reconnect_attempt', (attempt) => {
        console.log(`Reconnection attempt ${attempt}`)
      })

      socket.io.on('error', (error) => {
        console.error('Transport error:', error)
      })

      return () => {
        clearInterval(healthInterval)
        socket.close()
      }
    } catch (err) {
      console.error('Error setting up Socket.IO:', err)
      setError('Failed to connect')
      setStatus('error')
    }
  }, [retryCount]) // Recreate socket when retry count changes

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
            {status === 'connecting' && `Connecting${retryCount > 0 ? ` (Attempt ${retryCount})` : ''}...`}
            {status === 'ready' && 'Ready for content'}
            {status === 'error' && `Error: ${error}`}
          </span>
        </div>
      )}
    </div>
  )
}
