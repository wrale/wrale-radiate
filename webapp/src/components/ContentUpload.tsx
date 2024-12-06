'use client';

import { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

export function ContentUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')

  const { sendMessage, isConnected } = useWebSocket({
    onConnected: () => console.log('Connected to WebSocket server'),
    onDisconnected: () => console.log('Disconnected from WebSocket server')
  })

  const notifyDisplays = async (url: string) => {
    const playMessage = {
      type: 'play',
      url,
      contentId: `content-${Date.now()}` // Simple unique ID generation
    }
    sendMessage(playMessage)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

    setUploading(true)
    setError('')
    setSuccess('')

    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Send play command to displays via WebSocket
      await notifyDisplays(data.url)

      setSuccess('File uploaded and distributed successfully!')
      e.target.value = '' // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoUrl) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'URL upload failed')
      }

      // Send play command to displays via WebSocket
      await notifyDisplays(data.url)

      setSuccess('Video processed and distributed successfully!')
      setVideoUrl('') // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'URL upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setUploadMethod('file')}
          className={`px-4 py-2 rounded-lg ${uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Upload File
        </button>
        <button
          onClick={() => setUploadMethod('url')}
          className={`px-4 py-2 rounded-lg ${uploadMethod === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
        >
          Use URL
        </button>
      </div>

      {!isConnected && (
        <p className="text-yellow-500">⚠️ WebSocket disconnected - displays may not update</p>
      )}

      {uploadMethod === 'file' ? (
        <div>
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            accept="video/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      ) : (
        <form onSubmit={handleUrlUpload} className="space-y-2">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={uploading}
            placeholder="Enter video URL (e.g., https://example.com/video.mp4)"
            className="block w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={uploading || !videoUrl}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            Process URL
          </button>
        </form>
      )}

      {uploading && (
        <p className="text-gray-500">Uploading...</p>
      )}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-green-500">{success}</p>
      )}
    </div>
  )
}
