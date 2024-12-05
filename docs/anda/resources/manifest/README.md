# Manifest Resource

## Overview
The manifest defines what content should play when and how, serving as the source of truth for content sequencing.

## Schema

```yaml
version: string           # Timestamp-based version identifier
default_content: string   # Fallback content identifier
valid_from: string       # When this manifest becomes active
valid_until: string      # When this manifest expires

sequence:
  - content_id: string   # Unique identifier for the content
    url: string         # Content location
    type: string        # Content MIME type
    duration: number    # Play duration in seconds
    start_at: string    # Absolute start time
    checksum: string    # Content validation hash
    fallback: string    # Optional: fallback content id
```

## States

### Lifecycle
1. Created - New manifest uploaded
2. Validated - Schema and references checked
3. Active - Current controlling manifest
4. Expired - No longer controlling playback

### Validity
- Must reference existing content
- Must have valid time windows
- Must include fallback options

## Behavior

### Version Control
- Each change creates new version
- Old versions preserved
- Clear transition timing

### Content Reference
- Points to content locations
- Includes validation data
- Defines playback parameters

### Time Control
- Defines absolute timing
- Supports synchronized playback
- Handles time zone differences

## Access Patterns

### Content Composer
- Creates new manifests
- Updates existing manifests
- Views manifest history

### Display Node
- Polls for current manifest
- Validates manifest integrity
- Follows manifest timing