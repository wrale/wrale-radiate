# Synchronization

## Overview
How playback timing is coordinated across display nodes.

## Timing Model

### Time Sources
- NTP for basic synchronization
- Manifest for content timing
- Coordinator for adjustments

### Precision Targets
- Within few seconds
- Consistent across nodes
- Stable during playback

## Synchronization Flow

### Initial Sync
1. Display Node -> NTP
   - Get reference time
   - Set local clock

2. Display Node -> Coordinator
   - Get current manifest
   - Get timing offsets
   - Prepare content

### Maintenance
1. Regular Steps
   - Check drift
   - Report position
   - Get adjustments

2. Adjustment Process
   - Calculate offset
   - Apply smoothly
   - Verify result

## Error Handling

### Time Drift
- Detect deviation
- Calculate correction
- Apply gradually

### Network Issues
- Use local timing
- Maintain approximate sync
- Recover when possible

### Content Problems
- Use fallback content
- Maintain timing
- Report issues

## Optimization

### Network Usage
- Batch timing updates
- Predict adjustments
- Minimize checks

### Processing Load
- Efficient calculations
- Smooth transitions
- Background processing