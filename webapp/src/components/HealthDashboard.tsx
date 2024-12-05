"use client"

import { useEffect, useState } from 'react'

interface DisplayHealth {
  displayId: string
  status: string
  currentTime?: number
  duration?: number
}

export const HealthDashboard = () => {
  const [displays, setDisplays] = useState<Record<string, DisplayHealth>>({})

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/api/ws`)

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'health') {
          setDisplays(prev => ({
            ...prev,
            [message.displayId]: {
              displayId: message.displayId,
              status: message.status,
              currentTime: message.currentTime,
              duration: message.duration
            }
          }))
        }
      } catch (err) {
        console.error('Error processing message:', err)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="max-w-4xl p-4 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(displays).map((display) => (
          <div key={display.displayId} className="p-4 border rounded">
            <h3 className="font-medium mb-2">Display {display.displayId}</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${display.status === 'playing' ? 'bg-green-500' : 'bg-blue-500'}`} />
                <span className="capitalize">{display.status}</span>
              </div>

              {display.currentTime !== undefined && display.duration !== undefined && (
                <div className="text-sm text-gray-600">
                  {Math.floor(display.currentTime)}s / {Math.floor(display.duration)}s
                </div>
              )}
            </div>
          </div>
        ))}

        {Object.keys(displays).length === 0 && (
          <div className="p-4 border rounded text-gray-500">
            No displays connected
          </div>
        )}
      </div>
    </div>
  )
}
