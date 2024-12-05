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

```bash
# Start the development environment
docker compose up

# Visit management interface
open http://localhost:3000

# Visit display simulator
open http://localhost:3001
```

## Technology Stack

- TypeScript/Next.js for all components
- MinIO for content storage
- WebSocket for real-time updates