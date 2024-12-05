# Actor Interactions and Data Flows

## Content Update Flow

### Actor Need
Content Composer needs to deploy new content to all displays with minimal complexity.

### Key Interactions
1. Content Composer -> Content Distribution System
   - Upload new content
   - Receive storage confirmation

2. Content Composer -> Manifest Service
   - Create/update manifest
   - Set timing parameters

3. Display Node -> Manifest Service
   - Poll for manifest updates
   - Download new content if needed

### Success Criteria
- Content Composer knows when deployment is ready
- Content Composer can predict when content will be playing
- Display Nodes get content reliably despite network issues

### Assumptions
- Cloud storage is reliable and accessible
- Content size is manageable for average internet connections
- Local storage on Display Nodes is adequate

## Status Monitoring Flow

### Actor Need
Content Composer needs to verify correct playback across all displays.

### Key Interactions
1. Display Node -> Status Channel
   - Maintain long-poll connection
   - Report current manifest version
   - Report playback position and quality
   - Signal any error conditions

2. Content Composer -> Status Channel
   - View aggregated status
   - Send control commands if needed

### Success Criteria
- Content Composer can quickly identify playback issues
- Status updates don't overwhelm network connections
- Error conditions are clearly reported

### Assumptions
- Network allows long-poll connections
- Status data volume is manageable
- Display Nodes can measure their state accurately

## Synchronization Flow

### Actor Need
Content Composer needs displays to be playing content in rough synchronization.

### Key Interactions
1. Display Node -> Manifest Service
   - Get current manifest version
   - Receive timing parameters

2. Display Node -> Status Channel
   - Report actual playback position
   - Receive timing adjustments

### Success Criteria
- Displays stay within few seconds of synchronization
- System handles network delays gracefully
- Resync happens automatically after interruptions

### Assumptions
- NTP is available
- Brief sync variations are acceptable
- Network latency is predictable

## Error Recovery Flow

### Actor Need
Both actors need to handle and recover from common failure scenarios.

### Key Interactions
1. Display Node -> Status Channel
   - Report error conditions
   - Signal recovery attempts
   - Confirm resolution

2. Content Composer -> Status Channel
   - View error states
   - Issue recovery commands
   - Verify resolution

### Success Criteria
- System recovers automatically from common errors
- Content Composer is informed of serious issues
- Error states don't require local intervention

### Assumptions
- Most errors are recoverable automatically
- Fallback content is available locally
- System can maintain partial operation during issues

## Data Volume Considerations

### Content Data
- Primary flow: Cloud Storage -> Display Nodes
- Frequency: As manifests update
- Criticality: High
- Bandwidth Impact: High
- Caching: Local caching required

### Status Data
- Primary flow: Display Nodes -> Status Channel
- Frequency: Regular intervals
- Criticality: Medium
- Bandwidth Impact: Low
- Caching: Not applicable

### Control Data
- Primary flow: Bidirectional through Status Channel
- Frequency: As needed
- Criticality: High
- Bandwidth Impact: Minimal
- Caching: Not applicable