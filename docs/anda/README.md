# Wrale Radiate - Actor-Needs Driven Architecture Documentation

## Primary Actors and Their Needs

### 1. Content Composer
Location: Central facility
Primary Needs:
- Upload new video content (frequency: daily)
- Verify playback status across all displays
  * Confirm video is playing
  * Verify video quality/resolution
  * Monitor audio playback
  * Ensure rough synchronization (within seconds) between displays

Success Criteria:
- Can upload new content and see it playing on all displays
- Can quickly identify any playback issues
- Can confirm displays are roughly synchronized

### 2. Display Nodes
Location: Remote buildings
Characteristics:
- Behind NAT
- Average internet reliability
- Minimal on-site IT support

Needs:
- Receive new content reliably
- Play content consistently
- Report status accurately
- Maintain approximate synchronization with other displays

## MVP Capabilities (Steel Thread)

### Core Functions
1. Content Distribution
   - Actor Need: Content Composer needs to deploy new videos
   - Minimal Solution: HTTP-based upload to central coordinator
   - Would be obsolete if: Direct peer-to-peer content distribution became possible

2. Status Monitoring
   - Actor Need: Content Composer needs playback verification
   - Minimal Solution: Basic heartbeat and playback state reporting
   - Would be obsolete if: Direct visual verification became possible

3. Synchronization
   - Actor Need: Content Composer needs roughly synchronized playback
   - Minimal Solution: Time-based coordination through central server
   - Would be obsolete if: Local time sync or frame-perfect sync became required

### System Components

1. Central Coordinator
   Purpose:
   - Bridge NAT constraints
   - Coordinate content distribution
   - Aggregate status information
   - Provide basic synchronization signals

2. Display Node Client
   Purpose:
   - Poll for and download new content
   - Play video content
   - Report playback status
   - Maintain rough synchronization

3. Content Composer Interface
   Purpose:
   - Upload new content
   - View aggregated status
   - Monitor synchronization

## Architectural Decisions

### 1. Polling-based Communication
Decision: Display nodes poll coordinator for updates
Rationale:
- Works through NAT without special configuration
- Tolerates intermittent connectivity
- Simpler than maintaining persistent connections
Would be obsolete if: NAT traversal or direct connectivity became reliable

### 2. Central Content Distribution
Decision: All content flows through coordinator
Rationale:
- Simplifies content deployment
- Enables basic synchronization
- Provides single source of truth
Would be obsolete if: Edge distribution or P2P became more appropriate

### 3. Status Aggregation
Decision: Coordinator aggregates all status information
Rationale:
- Gives content composer single view of system
- Simplifies monitoring
- Enables basic troubleshooting
Would be obsolete if: Direct node monitoring became possible

## Future Considerations (Not in MVP)

1. Content Scheduling
2. Content Library Management
3. Playback History/Reporting
4. More Precise Synchronization
5. Multiple Content Streams

These features have been deliberately excluded from MVP to maintain focus on the core "steel thread" functionality.