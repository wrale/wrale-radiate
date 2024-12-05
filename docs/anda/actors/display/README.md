# Display Node

## Overview
Display Nodes are the remote playback points in the Wrale Radiate system, responsible for reliable content presentation and status reporting.

## Location
Remote buildings

## Primary Needs

### Content Reception
- Receive content reliably
- Cache content locally
- Handle network interruptions

### Playback
- Play content consistently
- Maintain quality
- Stay synchronized with other displays

### Status Reporting
- Report playback status
- Signal error conditions
- Provide quality metrics

## Characteristics

### Network
- Behind NAT
- Average internet reliability
- Must handle intermittent connectivity

### Support
- Minimal on-site IT support
- Must operate autonomously
- Must self-recover when possible

### Hardware
- Standard display capability
- Local storage for caching
- Basic processing power

## Success Criteria

### Content
- Receives and caches content reliably
- Plays content at specified quality
- Maintains synchronization within seconds

### Operations
- Operates with minimal intervention
- Recovers automatically from common issues
- Reports status accurately

### Reliability
- Handles network issues gracefully
- Falls back to cached content when needed
- Maintains basic operation during problems

## Constraints

### Network
- Must work through NAT
- Must handle variable bandwidth
- Must support long-polling

### Storage
- Limited local storage
- Must manage cache effectively
- Must validate content integrity

### Processing
- Limited processing power
- Must handle video playback
- Must measure playback metrics