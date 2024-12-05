import { useEffect, useState } from 'react'

type DisplayStatus = {
  id: string
  status: 'online' | 'offline'
  lastUpdate: string
}

export function HealthDashboard() {
  const [displays, setDisplays] = useState<DisplayStatus[]>([])

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:3000')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'status') {
          setDisplays(current => {
            const index = current.findIndex(d => d.id === data.id)
            if (index >= 0) {
              return [
                ...current.slice(0, index),
                { ...data, lastUpdate: new Date().toISOString() },
                ...current.slice(index + 1)
              ]
            }
            return [...current, { ...data, lastUpdate: new Date().toISOString() }]
          })
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="space-y-4">
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
                    display.status === 'online'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {display.status}
                </span>
              </div>
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
