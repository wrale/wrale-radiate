# Wrale Radiate

Global Display Manager - Steel Thread Implementation

## Core Flow

This implementation focuses on the minimal viable path:

1. Content Management (MKTG_CONTENT_MGMT)
   - Upload and manage video content
   - Track content status

2. Content Transport (CAP_CONTENT_TRANSPORT)
   - Reliable content delivery to displays
   - Basic bandwidth management

3. Basic Rendering (CAP_BASIC_RENDER)
   - H.264 video playback
   - Display status reporting

4. Health Monitoring (CAP_DISPLAY_HEALTH)
   - Basic display health tracking
   - Content playback verification

## Quick Start

The project supports both Docker Compose and Podman Compose. Use the Makefile for consistent operation:

```bash
# Check requirements and initialize
make init

# Start all services
make up

# Open interfaces in browser
make open

# View logs
make logs
```

## Development

### Container Access
```bash
# Access webapp shell
make shell-webapp

# Access display client shell
make shell-display

# View specific logs
make webapp-logs
make display-logs
```

### Clean Up
```bash
# Stop services
make down

# Full cleanup (including volumes)
make clean
```

## Architecture

### Technology Stack
- TypeScript/Next.js for all components
- MinIO for content storage
- WebSocket for real-time updates

### Components
1. Management Interface (Port 3000)
   - Content upload and management
   - Display health monitoring
   - Real-time status updates

2. Display Client (Port 3001)
   - Video playback
   - Health reporting
   - WebSocket connectivity

3. Storage
   - MinIO for video assets
   - Local volume persistence

## Development Status

This is a steel thread implementation, focusing on proving the core workflow. It provides:
- ✅ End-to-end content flow
- ✅ Real-time health monitoring
- ✅ Basic display simulation