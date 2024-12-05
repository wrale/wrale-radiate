# Status Monitoring Decisions

## Long-Poll Status Channel

### Context
- Displays behind NAT
- Need bidirectional communication
- Status updates important
- Control messages needed

### Decision
Implement long-polling status channel:
- Display nodes initiate
- Persistent connection
- Bidirectional capable
- Efficient protocol

### Consequences
Benefits:
- Works through NAT
- Real-time capable
- Resource efficient
- Simple to implement

Tradeoffs:
- Some latency
- Server resources
- Connection management

### Obsolescence
Would be obsolete if:
- Direct connectivity possible
- WebRTC widely supported
- Different protocol preferred

## Status Aggregation

### Context
- Multiple displays
- Various metrics
- Need overview
- Quick response required

### Decision
Implement hierarchical aggregation:
- Local processing
- Batched updates
- Priority levels
- Efficient storage

### Consequences
Benefits:
- Scalable system
- Quick overview
- Efficient storage
- Good performance

Tradeoffs:
- More complex
- Some delay
- Processing overhead

### Obsolescence
Would be obsolete if:
- Direct monitoring possible
- Different metrics needed
- Real-time only required

## Error Handling

### Context
- Various failure modes
- Limited local support
- Quick recovery needed
- Status important

### Decision
Implement multi-level recovery:
- Automatic retry
- Fallback content
- Status reporting
- Manual override

### Consequences
Benefits:
- Reliable operation
- Clear status
- Quick recovery
- Low maintenance

Tradeoffs:
- Complex logic
- More testing needed
- Resource overhead

### Obsolescence
Would be obsolete if:
- Perfect reliability achieved
- Local support available
- Different recovery needed