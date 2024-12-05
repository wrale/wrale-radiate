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

  // Make the initial request
  const response = await fetch(url, {
    redirect: 'follow',     // Follow redirects automatically
    headers: {
      'Accept': 'video/*',  // Request video content
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'  // Pretend to be a browser
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  // Check if we got HTML instead of video content
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('text/html')) {
    // Try to extract the actual video URL from the response
    const text = await response.text()
    console.log('Received HTML instead of video. Content:', text.substring(0, 500))
    throw new Error('Received HTML page instead of video file. Please provide direct video URL.')
  }

  // Log headers for debugging
  console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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

  // Verify we got actual video content (check first few bytes for video file signatures)
  const firstBytes = buffer.subarray(0, 8)
  const isMP4 = firstBytes.includes(Buffer.from('ftyp'))
  if (!isMP4) {
    console.log('First bytes:', firstBytes)
    throw new Error('Downloaded content does not appear to be a valid video file')
  }

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

async function storeFile(formData: FormData): Promise<string> {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!validExtensions.has(extension)) {
    throw new Error(`Invalid file type. Must be one of: ${Array.from(validExtensions).join(', ')}`)
  }

  // Read file as array buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  // Generate unique object name
  const objectName = `${Date.now()}-${file.name}`

  // Upload to MinIO
  await minioClient.putObject(
    bucketName,
    objectName,
    buffer,
    buffer.length
  )

  // Get temporary URL for the object
  return await minioClient.presignedGetObject(bucketName, objectName, 24*60*60) // 24 hour expiry
}

export async function POST(request: Request) {
  try {
    await ensureBucket()

    let storedUrl: string
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      storedUrl = await storeFile(formData)
    } else {
      // Handle URL upload
      const data = await request.json()
      if (!data.url) {
        return NextResponse.json({ error: 'URL required' }, { status: 400 })
      }
      storedUrl = await downloadAndStore(data.url)
    }

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
