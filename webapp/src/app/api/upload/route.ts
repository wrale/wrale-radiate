import { NextResponse } from 'next/server'
import { Client } from 'minio'
import type { WebSocketServer } from 'ws'
import type { CustomWebSocket, WebSocketMessage } from '@/lib/types'

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost'
const minioPort = parseInt(process.env.MINIO_PORT || '9000')

const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const BUCKET_NAME = 'content'

async function downloadVideo(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  // Use node-fetch style options to ensure proper streaming
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'Accept': 'video/*,*/*',
      'User-Agent': 'Wrale-Radiate/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`)
  }
  
  // Get content length if available
  const contentLength = response.headers.get('content-length')
  console.log(`Content length: ${contentLength} bytes`)

  // Stream the response to buffer
  const chunks: Buffer[] = []
  const reader = response.body?.getReader()
  
  if (!reader) {
    throw new Error('Failed to initialize download stream')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(Buffer.from(value))
    }
  }

  const buffer = Buffer.concat(chunks)
  console.log(`Downloaded size: ${buffer.length} bytes`)

  // Determine content type
  let contentType = response.headers.get('content-type') || ''
  if (!contentType.startsWith('video/')) {
    // Fallback to MP4 for known video URLs
    if (url.toLowerCase().endsWith('.mp4')) {
      contentType = 'video/mp4'
    } else {
      throw new Error('URL does not appear to be a video file')
    }
  }

  return { buffer, contentType }
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

      console.log('Downloading from URL:', url)
      try {
        const downloadResult = await downloadVideo(url)
        buffer = downloadResult.buffer
        contentType = downloadResult.contentType
        fileName = url.split('/').pop() || 'video.mp4'
        console.log(`Downloaded ${buffer.length} bytes`)
      } catch (error) {
        console.error('Download error:', error)
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to download video' },
          { status: 400 }
        )
      }
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

    console.log(`Uploading to MinIO: ${buffer.length} bytes`)
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
