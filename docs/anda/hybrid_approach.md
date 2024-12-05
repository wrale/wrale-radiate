# Hybrid Content Distribution and Control Approach

## Overview
This approach combines manifest-based content sequencing with active status monitoring and control.

## Core Components

### 1. Content Manifest Service
Purpose: Define content sequence and timing

Actor Need: Content Composer needs reliable content deployment and synchronization
- Manifest format defines:
  * Content URLs and types
  * Play sequence and timing
  * Fallback content
  * Validation checksums
- Changes trigger version updates
- Display nodes poll for manifest updates

### 2. Content Distribution
Purpose: Efficient content delivery to display nodes

Actor Need: Display nodes need reliable content access despite network limitations
- Content stored in cloud storage
- Optional CDN distribution
- Coordinator provides signed URLs
- Display nodes cache content locally
- Progressive download for new content

### 3. Status Channel
Purpose: Active monitoring and control despite NAT

Actor Need: Content Composer needs playback verification
- Display nodes establish long poll to coordinator
- Regular status updates include:
  * Current manifest version
  * Playback position
  * Content cached/downloading
  * Performance metrics
  * Error states

### 4. Time Synchronization
Purpose: Maintain rough synchronization between displays

Actor Need: Content Composer needs synchronized playback
- NTP for basic clock sync
- Manifest includes timing anchors
- Coordinator provides sync adjustments
- Display nodes report timing drift

## Key Flows

### Content Update Flow
1. Content Composer uploads new content
2. Files moved to cloud storage
3. New manifest version created
4. Display nodes detect manifest update
5. New content downloaded in background
6. Switch to new content at specified time

### Status Monitoring Flow
1. Display nodes maintain long poll connection
2. Regular status updates sent through channel
3. Coordinator aggregates status
4. Content Composer views unified status
5. Control commands sent through status channel

### Error Recovery Flow
1. Display node detects error condition
2. Reports through status channel
3. Attempts local recovery based on manifest rules
4. Coordinator can push recovery commands
5. Falls back to cached content if needed

## Benefits of Hybrid Approach

### For Content Distribution
- Efficient content delivery through CDN
- Background preloading of content
- Local caching for reliability
- Clear content versioning

### For Status Monitoring
- Reliable bidirectional communication
- Real-time status visibility
- Active control capability
- Works through NAT

### For Synchronization
- Manifest provides timing framework
- Active adjustments possible
- Fallback to local timing
- Handles network issues gracefully

## Implementation Considerations

### Manifest Format
```yaml
version: "2024-03-14T12:00:00Z"
default_content: "fallback.mp4"
sequence:
  - content_id: "main_video"
    url: "https://storage/video1.mp4"
    type: "video/mp4"
    duration: 300
    start_at: "2024-03-14T12:00:00Z"
    checksum: "sha256:abc123"
  - content_id: "weather_update"
    url: "https://storage/weather.html"
    type: "text/html"
    duration: 60
```

### Status Channel Protocol
- Long polling for NAT traversal
- Compressed status updates
- Batch updates for efficiency
- Priority levels for messages

### Local Cache Management
- Keep N most recent versions
- Pre-fetch during low usage
- Clear old versions
- Validate content integrity

## Future Expansion

### Content Types
- Videos (MVP)
- Web content
- Live data feeds
- Emergency alerts
- Interactive content

### Enhanced Features
- Content scheduling
- A/B testing
- Usage analytics
- Remote configuration