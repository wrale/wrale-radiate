# Content Distribution Decisions

## Hybrid Distribution Approach

### Context
- Content must reach displays behind NAT
- Network reliability varies
- Local IT support minimal
- Synchronization needed

### Decision
Adopt hybrid approach combining:
- Manifest-based content sequencing
- Cloud storage for content
- Local content caching
- Status channel for control

### Consequences
Benefits:
- Efficient content distribution
- Clear versioning
- Reliable playback
- Good failure handling

Tradeoffs:
- More complex than pure streaming
- Requires storage management
- Need manifest handling

### Obsolescence
Would be obsolete if:
- Direct peer-to-peer became reliable
- Perfect connectivity guaranteed
- Real-time streaming required

## Manifest Format

### Context
- Need content sequencing
- Time synchronization required
- Various content types possible
- Must handle failures

### Decision
Use versioned manifest that specifies:
- Content references
- Timing parameters
- Fallback behavior
- Validation data

### Consequences
Benefits:
- Clear content control
- Simple synchronization
- Good error handling
- Future extensibility

Tradeoffs:
- Additional complexity
- Must manage versions
- Need validation logic

### Obsolescence
Would be obsolete if:
- Real-time control needed
- Frame-perfect sync required
- Dynamic content dominant

## Caching Strategy

### Context
- Network not always reliable
- Content size significant
- Quick recovery needed
- Storage limited

### Decision
Implement local caching with:
- Recent version retention
- Preloading capability
- Integrity validation
- Space management

### Consequences
Benefits:
- Reliable playback
- Network efficient
- Quick recovery
- Bandwidth saving

Tradeoffs:
- Storage overhead
- Cache management needed
- More complex logic

### Obsolescence
Would be obsolete if:
- Perfect connectivity assured
- Storage became constraint
- Real-time only content