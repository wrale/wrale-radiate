import { NextResponse } from 'next/server'
import { Client } from 'minio'
import type { WebSocketMessage } from '@/lib/types'
import { Readable } from 'stream'

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost'
const minioPort = parseInt(process.env.MINIO_PORT || '9000')
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin'
const bucketName = 'content'

const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey
})

// Ensure bucket exists
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
      await minioClient.makeBucket(bucketName)
      console.log(`Created bucket ${bucketName}`)
    }
  } catch (err) {
    console.error('Error ensuring bucket exists:', err)
    throw err
  }
}

async function downloadAndStore(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  // Get content length and type if available
  const contentLength = response.headers.get('content-length')
  const contentType = response.headers.get('content-type')

  if (!contentType?.startsWith('video/')) {
    throw new Error('URL must point to a video file')
  }

  // Generate object name from URL
  const objectName = `${Date.now()}-${url.split('/').pop()}`

  // Get the response body as a ReadableStream
  const bodyStream = response.body
  if (!bodyStream) {
    throw new Error('Failed to get response stream')
  }

  // Convert ReadableStream to Node.js Readable stream
  const readable = Readable.fromWeb(bodyStream)

  // Upload to MinIO using streams
  await minioClient.putObject(
    bucketName,
    objectName,
    readable,
    parseInt(contentLength || '0')  // Pass content length if known
  )

  // Get temporary URL for the object
  const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName, 24*60*60) // 24 hour expiry
  
  return presignedUrl
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { url } = data

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    await ensureBucket()
    const storedUrl = await downloadAndStore(url)

    const playMessage: WebSocketMessage = {
      type: 'play',
      url: storedUrl
    }

    return NextResponse.json({ success: true, message: playMessage })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 })
  }
}