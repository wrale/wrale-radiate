# Wrale Radiate - Actor-Needs Driven Architecture Documentation

## Primary Actors and Their Needs

### 1. Content Composer
Location: Central facility
Primary Needs:
- Upload and schedule content for synchronized playback
- Verify playback status across all displays
  * Confirm content is playing
  * Verify playback quality
  * Monitor audio when applicable
  * Ensure rough synchronization (within seconds) between displays

Success Criteria:
- Can deploy content and see it playing on all displays
- Can quickly identify any playback issues
- Can confirm displays are roughly synchronized

### 2. Display Nodes
Location: Remote buildings
Characteristics:
- Behind NAT
- Average internet reliability
- Minimal on-site IT support

Needs:
- Receive content reliably
- Play content consistently
- Report status accurately
- Maintain approximate synchronization with other displays

## MVP Capabilities (Steel Thread)

### Core Functions
1. Content Distribution
   - Actor Need: Content Composer needs to deploy content reliably
   - Minimal Solution: Manifest-based content delivery through cloud storage
   - Would be obsolete if: Direct peer-to-peer content distribution became possible

2. Status Monitoring
   - Actor Need: Content Composer needs playback verification
   - Minimal Solution: Long-poll status channel with aggregated reporting
   - Would be obsolete if: Direct visual verification became possible

3. Synchronization
   - Actor Need: Content Composer needs roughly synchronized playback
   - Minimal Solution: Manifest timing with NTP and coordinator adjustments
   - Would be obsolete if: Frame-perfect sync became required

### System Components

1. Content Manifest Service
   Purpose:
   - Define content sequence and timing
   - Manage content versions
   - Provide fallback behavior

2. Status Channel Service
   Purpose:
   - Enable NAT traversal
   - Aggregate display status
   - Provide control path
   - Support sync adjustments

3. Content Distribution System
   Purpose:
   - Store content securely
   - Enable efficient delivery
   - Support local caching
   - Handle progressive download

## Architectural Decisions

### 1. Hybrid Communication Model
Decision: Combine manifest-based delivery with active status channel
Rationale:
- Efficient content distribution via cloud storage/CDN
- Reliable status monitoring through long-polling
- Supports both video and non-video content
Would be obsolete if: Direct peer-to-peer communication became reliable

### 2. Manifest-Based Sequencing
Decision: Use versioned manifests for content coordination
Rationale:
- Clear content versioning
- Simplified synchronization
- Support for mixed content types
Would be obsolete if: Real-time content streaming became necessary

### 3. Long-Poll Status Channel
Decision: Maintain long-poll connection for status and control
Rationale:
- Works through NAT
- Provides near real-time status
- Enables active control
Would be obsolete if: Direct node communication became possible

## Future Considerations (Not in MVP)

1. Content Scheduling
2. Content Library Management
3. Playback History/Reporting
4. Interactive Content Support
5. Emergency Alert Integration

These features have been deliberately excluded from MVP to maintain focus on the core "steel thread" functionality.