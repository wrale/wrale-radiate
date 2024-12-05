"use client"

import { useState } from 'react'

export const ContentUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file')

    if (!file) {
      setError('Please select a file')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)
      setSuccess(true)

      // Reset form
      e.currentTarget.reset()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl p-4 border rounded-lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-1">
            Upload Video Content
          </label>
          <input
            type="file"
            id="file"
            name="file"
            className="w-full"
            accept="video/mp4,video/x-m4v,video/*"
            onChange={() => {
              setError(null)
              setSuccess(false)
            }}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600">
            Upload successful!
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}
