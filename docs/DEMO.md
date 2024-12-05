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

The management interface (http://localhost:3000) provides two ways to add content:

#### Option A: Direct URL
1. Click "Use URL" in the content management section
2. Paste this sample video URL:
   ```
   https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_1920_18MG.mp4
   ```
3. Click "Process URL"
4. Watch for the upload confirmation

#### Option B: File Upload
1. Click "Upload File" in the content management section
2. Either:
   - Download the sample video above and upload it, or
   - Use any H.264-encoded MP4 file
3. Select the file and watch for upload confirmation

Both methods will store the content in MinIO (viewable in MinIO console)

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
3. Upload content (via URL or file) to see synchronized delivery
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
   - Direct URL:
     - Check if URL is accessible
     - Verify it's a direct link to an MP4 file
     - Check webapp logs for download errors
   - File Upload:
     - Verify file is H.264 encoded
     - Check file size (should be under 100MB for demo)
     - Check MinIO connectivity

2. Display connection issues
   - Verify WebSocket connection in browser console
   - Check display client logs
   - Restart display client if needed

3. Playback issues
   - Verify video codec is H.264
   - Check browser console for player errors
   - Verify content URL is accessible