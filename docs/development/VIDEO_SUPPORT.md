# Video Support Guide

## Supported Formats

### Primary Format
- Container: MP4
- Codec: H.264
- Profile: High
- Level: 4.1 or lower

### Recommended Settings
- Resolution: 1920x1080 max
- Framerate: 30fps
- Bitrate: 5Mbps max
- Keyframe Interval: 2 seconds

## Browser Support

Tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Common Issues

### Playback Issues
1. Black screen but audio plays
   - Cause: Codec compatibility
   - Solution: Re-encode to H.264 High Profile

2. Stuttering playback
   - Cause: Network bandwidth or CPU limitations
   - Solution: Reduce bitrate or resolution

### Upload Issues
1. File size limits
   - Default: 100MB
   - Configurable via environment variables

2. Format validation
   - Client-side: MIME type check
   - Server-side: Format verification

## Encoding Recommendations

```bash
# FFmpeg command for optimal compatibility
ffmpeg -i input.mp4 \
  -c:v libx264 -profile:v high -level:v 4.1 \
  -preset medium -crf 23 \
  -maxrate 5M -bufsize 10M \
  -vf "scale=1920:-2" \
  -c:a aac -b:a 128k \
  output.mp4
```
