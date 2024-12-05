# Video Support Guide

## Supported Formats

### Container & Codec
- Container: MP4
- Codec: H.264
- Profile: High

We accept any resolution supported by the display hardware and HTML5 video playback.

### Recommended Encoding Settings
- Keyframe Interval: 2 seconds (ensures smooth seeking)
- Variable bitrate supported

## Playback Support

Playback relies on native HTML5 video capabilities and hardware acceleration where available.

### Browser Support
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
   - Cause: Local hardware limitations or network constraints
   - Solution: Monitor system resources and network bandwidth

### Upload Issues
1. File size limits
   - Default: Determined by available storage
   - Configurable via environment variables

2. Format validation
   - Client-side: MIME type check
   - Server-side: Format verification

## Example FFmpeg Command

```bash
# Basic H.264 encoding suitable for web playback
ffmpeg -i input.mp4 \
  -c:v libx264 -profile:v high \
  -preset medium -crf 23 \
  -movflags +faststart \
  -c:a aac -b:a 128k \
  output.mp4
```

Notes:
- `-movflags +faststart`: Enables streaming before full download
- `crf 23`: Balanced quality/size (adjust 18-28 for better/smaller)
- Original resolution is preserved