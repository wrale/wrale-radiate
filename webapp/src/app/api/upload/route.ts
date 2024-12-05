import { NextResponse } from 'next/server'
import { Client } from 'minio'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const BUCKET_NAME = 'content'

export async function POST(request: Request) {
  try {
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME)
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const objectName = `${Date.now()}-${file.name}`

    await minioClient.putObject(BUCKET_NAME, objectName, buffer, {
      'Content-Type': file.type,
    })

    // Get temporary URL for the uploaded file
    const url = await minioClient.presignedGetObject(BUCKET_NAME, objectName)

    // Broadcast to all connected displays
    const wsServer = (global as any).wsServer
    if (wsServer) {
      wsServer.clients.forEach((client) => {
        client.send(JSON.stringify({
          type: 'play',
          url
        }))
      })
    }

    return NextResponse.json({ success: true, objectName, url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
