# Wrale Radiate Demo Guide

This guide walks through demonstrating the steel thread implementation of Wrale Radiate.

## Steel Thread Components

The demo showcases four core capabilities:
1. Content Management (MKTG_CONTENT_MGMT)
2. Content Transport (CAP_CONTENT_TRANSPORT)
3. Basic Rendering (CAP_BASIC_RENDER)
4. Health Monitoring (CAP_DISPLAY_HEALTH)

## Quick Start

1. Start the system:
   ```bash
   # First time setup
   make init
   make up
   
   # Or use the all-in-one command
   make cycle    # Clean, pull latest, initialize, and start
   ```

2. Open the interfaces:
   ```bash
   make open
   ```
   - Management Interface: http://localhost:3000
   - Display Simulator: http://localhost:3001
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## Demo Walkthrough

### 1. Content Management (MKTG_CONTENT_MGMT)
- Open the management interface (http://localhost:3000)
- Use the upload form in "Content Management" section
- For testing, you can use this sample H.264 video:
  ```
  https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_1920_18MG.mp4
  ```
  Right-click and save this file locally before uploading.
- Upload the saved video file
- Watch for upload confirmation
- Content is stored in MinIO (viewable in MinIO console)

### 2. Content Transport (CAP_CONTENT_TRANSPORT)
- System automatically:
  - Generates temporary URL for the content
  - Broadcasts URL via WebSocket
  - Manages delivery to connected displays
- View transport activity in `make webapp-logs`

### 3. Basic Rendering (CAP_BASIC_RENDER)
- Open the display simulator (http://localhost:3001)
- Observe automatic video playback when content arrives
- Video plays using H.264 codec
- Status reporting happens in background

### 4. Health Monitoring (CAP_DISPLAY_HEALTH)
- Watch the Health Dashboard in management interface
- Shows:
  - Display connection status
  - Real-time status updates
  - Last update timestamps

## Testing Multiple Displays

1. Open multiple display simulator tabs (http://localhost:3001)
2. Each tab simulates a separate display
3. Upload content to see synchronized delivery
4. Watch health dashboard track all displays

## Key Development Commands

```bash
# View all service logs
make logs

# View specific logs
make webapp-logs
make display-logs

# Container shells
make shell-webapp
make shell-display

# Stop services
make down

# Full cleanup
make clean
```

## Troubleshooting

### System Health
- Check service status: `make ps`
- View specific logs: `make webapp-logs` or `make display-logs`
- Verify MinIO console access: http://localhost:9001

### Common Issues
1. Upload failures
   - Check MinIO connectivity
   - Verify file is H.264 encoded
   - Check webapp logs

2. Display connection issues
   - Verify WebSocket connection in browser console
   - Check display client logs
   - Restart display client if needed