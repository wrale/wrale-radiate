'use client';

import { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

type DisplayStatus = {
  id: string
  status: 'playing' | 'ready' | 'error' | 'offline'
  lastUpdate: string
  currentContent?: string
  error?: string
}

export function HealthDashboard() {
  const [displays, setDisplays] = useState<DisplayStatus[]>([])

  const { isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'health') {
        setDisplays(current => {
          const index = current.findIndex(d => d.id === data.displayId)
          const newStatus: DisplayStatus = {
            id: data.displayId,
            status: data.status,
            lastUpdate: new Date().toISOString(),
            ...(data.contentId && { currentContent: data.contentId }),
            ...(data.error && { error: data.error })
          }

          if (index >= 0) {
            return [
              ...current.slice(0, index),
              newStatus,
              ...current.slice(index + 1)
            ]
          }
          return [...current, newStatus]
        })
      }
    }
  })

  return (
    <div className="space-y-4">
      {!isConnected && (
        <p className="text-yellow-500 mb-4">⚠️ WebSocket disconnected - display status may be outdated</p>
      )}

      {displays.length === 0 ? (
        <p className="text-gray-500">No displays connected</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displays.map((display) => (
            <div
              key={display.id}
              className="p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{display.id}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    display.status === 'playing'
                      ? 'bg-green-100 text-green-800'
                      : display.status === 'ready'
                      ? 'bg-blue-100 text-blue-800'
                      : display.status === 'offline'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {display.status}
                </span>
              </div>
              
              {display.currentContent && (
                <p className="text-sm text-gray-600 mt-2">
                  Content: {display.currentContent}
                </p>
              )}
              
              {display.error && (
                <p className="text-sm text-red-500 mt-1">
                  Error: {display.error}
                </p>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                Last update: {new Date(display.lastUpdate).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
