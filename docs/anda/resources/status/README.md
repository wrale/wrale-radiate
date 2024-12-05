# Status Resource

## Overview
Status represents the current state and health of system components.

## Schema

```yaml
timestamp: string          # Status report time
node_id: string           # Reporting node identifier
manifest_version: string  # Current manifest version

playback:
  content_id: string      # Current content
  position: number        # Playback position
  quality: object         # Quality metrics
    fps: number
    resolution: string
    audio: boolean

health:
  cpu: number            # CPU usage
  memory: number         # Memory usage
  storage: number        # Free storage
  temperature: number    # System temperature

errors: array            # Any error conditions
  - code: string
    message: string
    timestamp: string
```

## Collection

### Method
- Long-poll connection
- Regular updates
- Event-driven alerts

### Frequency
- Heartbeat: 30 seconds
- Metrics: 5 minutes
- Events: Immediate

### Aggregation
- By node
- By content
- By time period

## Usage

### Monitoring
- System health
- Playback status
- Error detection

### Analysis
- Performance trends
- Error patterns
- Usage statistics

### Control
- Trigger actions
- Adjust timing
- Initiate recovery