# Wrale Radiate Demo Guide

## Quick Start Demo

1. Start the System:
   ```bash
   make cycle   # Clean, pull latest, and start all services
   ```

2. Open the Interfaces:
   ```bash
   make open    # Opens both management and display interfaces
   ```
   - Management Interface: http://localhost:3000
   - Display Simulator: http://localhost:3001

## Demo Flow

### 1. Content Upload
1. Open the management interface (http://localhost:3000)
2. Under "Content Management", click the file upload button
3. Select a video file (supported formats: MP4/H.264)
4. Watch for the successful upload confirmation

### 2. Display Simulation
1. Open the display simulator (http://localhost:3001)
2. The simulator will automatically:
   - Connect to the management interface
   - Report its status (visible in the Health Dashboard)
   - Play any content that gets uploaded

### 3. Real-time Updates
1. The Health Dashboard on the management interface shows:
   - Connected display status
   - Real-time connection state
   - Last update timestamps

### 4. Content Distribution Flow
When you upload a video:
1. File is stored in MinIO object storage
2. Management interface generates a temporary URL
3. URL is broadcast via WebSocket to all connected displays
4. Display client receives URL and begins playback

## Troubleshooting

### Common Issues

1. **Display Not Connected**
   - Ensure both services are running (`make ps`)
   - Check display logs: `make display-logs`
   - Verify WebSocket connection in browser console

2. **Upload Failures**
   - Check webapp logs: `make webapp-logs`
   - Verify MinIO is running: http://localhost:9001
   - Check file format (must be MP4/H.264)

3. **Playback Issues**
   - Check browser console for errors
   - Verify video codec compatibility
   - Check display client logs: `make display-logs`

### Useful Commands

```bash
# View all logs
make logs

# View specific service logs
make webapp-logs
make display-logs

# Access service shells
make shell-webapp
make shell-display

# Restart services
make restart

# Full rebuild
make rebuild
```

## Next Steps

- Try uploading different video formats
- Connect multiple browser tabs to the display simulator
- Monitor real-time status updates
- Experiment with connection/disconnection behavior
