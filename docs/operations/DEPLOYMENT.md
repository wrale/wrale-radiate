# Deployment Guide

## Container Images

Base images:
- webapp: node:18-alpine
- display-client: node:18-alpine

## Resource Requirements

Minimum per container:
- webapp: 512MB RAM
- display-client: 256MB RAM
- minio: 512MB RAM

## Network Requirements

### Ports
- 3000: Management UI
- 3001: Display Client
- 9000: MinIO API
- 9001: MinIO Console

### Protocols
- HTTP/HTTPS for web interfaces
- WebSocket for real-time communication
- MinIO S3-compatible API

## Health Checks

### Management UI
- HTTP GET /api/health
- Expected response: 200 OK

### Display Client
- WebSocket connection status
- Video playback status

## Backup Strategy

### MinIO Data
- Volume: minio_data
- Backup frequency: Daily
- Retention: 7 days

## Monitoring

### Key Metrics
1. Display connectivity status
2. Video playback status
3. Content upload success rate
4. WebSocket connection status

### Logs
Key log locations:
- Management UI: stdout/stderr
- Display Client: stdout/stderr
- MinIO: stdout/stderr
