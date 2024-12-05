'use client';

import { useState } from 'react'

export function ContentUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

      setSuccess('File uploaded successfully!')
      e.target.value = '' // Reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
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
