# Actor Interactions and Data Flows

## Content Upload Flow

### Actor Need
Content Composer needs to deploy new video content to all displays with minimal complexity.

### Key Interactions
1. Content Composer -> Coordinator
   - Upload new video content
   - Receive upload confirmation
   - Get estimated deployment time

2. Display Node -> Coordinator
   - Poll for content updates
   - Receive new content metadata
   - Download content if new

### Success Criteria
- Content Composer knows when upload is complete
- Content Composer can predict when content will be playing
- Display Nodes get content reliably despite network issues

### Assumptions
- Upload bandwidth at central location is sufficient
- Content size is manageable for average internet connections
- Storage space on Display Nodes is adequate

## Status Monitoring Flow

### Actor Need
Content Composer needs to verify correct playback across all displays.

### Key Interactions
1. Display Node -> Coordinator
   - Regular heartbeat signal
   - Current playback position
   - Quality metrics (fps, resolution, audio status)
   - Any error conditions

2. Content Composer -> Coordinator
   - Request system status
   - Get aggregated display status

### Success Criteria
- Content Composer can quickly identify playback issues
- Status updates don't overwhelm network connections
- Error conditions are clearly reported

### Assumptions
- Network latency is acceptable for status updates
- Display Nodes can accurately measure their playback state
- Status data volume is manageable

## Synchronization Flow

### Actor Need
Content Composer needs displays to be playing content in rough synchronization.

### Key Interactions
1. Display Node -> Coordinator
   - Get current reference time
   - Report actual playback position
   - Receive sync adjustments

2. Coordinator -> Display Node
   - Provide reference timestamp
   - Send playback position adjustments
   - Define acceptable sync window

### Success Criteria
- Displays stay within few seconds of synchronization
- System handles network delays gracefully
- Resync happens automatically after interruptions

### Assumptions
- System clocks are reasonably accurate
- Network time sync is available
- Brief sync variations are acceptable

## Error Handling Flow

### Actor Need
Both actors need to handle and recover from common failure scenarios.

### Key Interactions
1. Display Node -> Coordinator
   - Report error conditions
   - Request content retry
   - Signal recovery status

2. Content Composer -> Coordinator
   - View error states
   - Initiate recovery actions
   - Verify resolution

### Success Criteria
- System recovers automatically from common errors
- Content Composer is informed of serious issues
- Error states don't require local intervention

### Assumptions
- Most errors are recoverable automatically
- Manual intervention is rare
- System can maintain partial operation during issues

## Data Volume Considerations

### Content Data
- Primary flow: Content Composer -> Coordinator -> Display Nodes
- Frequency: Daily
- Criticality: High
- Bandwidth Impact: High

### Status Data
- Primary flow: Display Nodes -> Coordinator -> Content Composer
- Frequency: Regular intervals (configurable)
- Criticality: Medium
- Bandwidth Impact: Low

### Control Data
- Primary flow: Bidirectional
- Frequency: As needed
- Criticality: High
- Bandwidth Impact: Minimal