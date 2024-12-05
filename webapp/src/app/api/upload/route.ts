import { NextResponse } from 'next/server'
import { Client } from 'minio'
import type { CustomWebSocket, WebSocketMessage } from '@/lib/types'

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost'
const minioPort = parseInt(process.env.MINIO_PORT || '9000')
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin'
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin'

const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { url } = data

    // TODO: Download from URL and store in MinIO
    // For now, just echo back the URL
    const playMessage: WebSocketMessage = {
      type: 'play',
      url
    }

    return NextResponse.json({ success: true, message: playMessage })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}