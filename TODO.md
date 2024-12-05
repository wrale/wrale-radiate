# Wrale Radiate TODO

## MVP1 Completion Checklist

### Testing (0%)
- [ ] Jest setup for webapp
- [ ] Jest setup for display client
- [ ] Basic component tests
- [ ] WebSocket connection tests
- [ ] Upload flow tests
- [ ] MinIO integration tests
- [ ] GitHub Actions CI setup

### Error Handling (50%)
- [ ] Content upload retry logic
- [ ] WebSocket reconnection logic
- [ ] Invalid file type handling
- [ ] Display connection timeout handling
- [ ] MinIO connection error handling

### Content Delivery (80%)
- [x] Basic video upload
- [x] WebSocket distribution
- [x] Video playback
- [ ] Basic bandwidth management
- [ ] Content validation

### Health Monitoring (90%)
- [x] Display connection status
- [x] Playback status
- [x] Basic metrics
- [ ] Connection history

### Configuration (40%)
- [ ] Environment variable documentation
- [ ] Configuration validation
- [ ] Default settings file
- [ ] Override mechanism

### Dependencies (0%)
- [ ] Investigate and resolve inflight memory leak warning
- [ ] Audit and update dependencies as needed
- [ ] Document dependency constraints and requirements

### Documentation (85%)
- [x] Development setup
- [x] Operations guide
- [x] Video support
- [ ] Troubleshooting guide
- [ ] Quick start examples with real scenarios

## Future Considerations
(Not for MVP1 - just tracking thoughts)

### Performance
- Load testing beyond single display
- Content optimization
- Caching strategies

### Security
- Authentication framework
- Content access controls
- Network security hardening

### Features
- Content scheduling
- Display groups
- Layout management
