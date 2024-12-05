import { NextResponse } from 'next/server'
import { Client } from 'minio'
import type { WebSocketServer } from 'ws'
import type { CustomWebSocket, WebSocketMessage } from '@/lib/types'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const BUCKET_NAME = 'content'

async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`)
  }
  
  const contentType = response.headers.get('content-type')
  if (!contentType?.startsWith('video/')) {
    throw new Error('URL does not point to a video file')
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function POST(request: Request) {
  try {
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME)
    }

    let buffer: Buffer
    let fileName: string
    let contentType: string

    // Check if this is a URL upload or file upload
    const contentTypeHeader = request.headers.get('content-type')
    if (contentTypeHeader?.includes('application/json')) {
      // Handle URL upload
      const { url } = await request.json()
      if (!url) {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
      }

      buffer = await downloadVideo(url)
      fileName = url.split('/').pop() || 'video.mp4'
      contentType = 'video/mp4' // Default to MP4 for URL uploads
    } else {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      buffer = Buffer.from(await file.arrayBuffer())
      fileName = file.name
      contentType = file.type
    }

    const objectName = `${Date.now()}-${fileName}`

    await minioClient.putObject(BUCKET_NAME, objectName, buffer, {
      'Content-Type': contentType,
    })

    // Get temporary URL for the uploaded file
    const url = await minioClient.presignedGetObject(BUCKET_NAME, objectName)

    // Broadcast to all connected displays
    const wsServer = (global as any).wsServer as WebSocketServer
    if (wsServer) {
      const message: WebSocketMessage = {
        type: 'play',
        url
      }
      wsServer.clients.forEach((client: CustomWebSocket) => {
        client.send(JSON.stringify(message))
      })
    }

    return NextResponse.json({ success: true, objectName, url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
