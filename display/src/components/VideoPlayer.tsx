"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<'connecting' | 'ready' | 'playing' | 'error'>('connecting')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!serverUrl) {
      setError('Server URL not configured')
      setStatus('error')
      return
    }

    try {
      console.log('Connecting to server:', serverUrl)

      const socket = io(serverUrl, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 5000,
      })

      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Socket.IO connected, ID:', socket.id)
        setStatus('ready')
        setError('')
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
        console.log('Connection acknowledged:', data)
      })

      socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err)
        setError(`Connection error: ${err.message}`)
        setStatus('error')
      })

      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason)
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

      return () => {
        clearInterval(healthInterval)
        socket.disconnect()
      }
    } catch (err) {
      console.error('Error setting up Socket.IO:', err)
      setError('Failed to connect')
      setStatus('error')
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
