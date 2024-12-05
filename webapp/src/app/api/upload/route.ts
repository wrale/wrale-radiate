import { NextResponse } from 'next/server'
import { Client } from 'minio'
import type { WebSocketMessage } from '@/lib/types'

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost'
const minioPort = parseInt(process.env.MINIO_PORT || '9000')
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin'
const bucketName = 'content'

// Valid video extensions
const validExtensions = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm'
])

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
  // Basic URL validation
  const urlObj = new URL(url)
  const pathname = urlObj.pathname.toLowerCase()
  const hasValidExtension = Array.from(validExtensions).some(ext => pathname.endsWith(ext))

  if (!hasValidExtension) {
    throw new Error(`URL must end with a valid video extension (${Array.from(validExtensions).join(', ')})`)
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  // Get content length and type if available
  const contentLength = response.headers.get('content-length')
  const contentType = response.headers.get('content-type')
  console.log('Content-Type:', contentType) // Debug log

  // Generate object name from URL
  const objectName = `${Date.now()}-${url.split('/').pop()}`

  // Read the response as an array buffer
  const chunks: Uint8Array[] = []
  const reader = response.body?.getReader()
  
  if (!reader) {
    throw new Error('Failed to get response reader')
  }

  let totalSize = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalSize += value.length
    chunks.push(value)
    console.log(`Downloaded ${totalSize} bytes`) // Progress logging
  }

  console.log('Total size:', totalSize) // Debug log
  const buffer = Buffer.concat(chunks)

  // Upload to MinIO
  await minioClient.putObject(
    bucketName,
    objectName,
    buffer,
    buffer.length
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