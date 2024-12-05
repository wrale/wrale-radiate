# Wrale Radiate ANDA Documentation

This documentation follows REST-like organization principles where actors, resources, and their interactions are first-class concepts.

## Structure

```
docs/anda/
├── actors/           # Each actor and their needs
│   ├── index.md     # Overview of all actors
│   ├── composer.md  # Content composer details
│   └── display.md   # Display node details
├── resources/       # System resources and their states
│   ├── index.md     # Resource overview
│   ├── content.md   # Content resource
│   ├── manifest.md  # Manifest resource
│   └── status.md    # Status resource
├── interactions/    # How actors interact with resources
│   ├── index.md     # Interaction patterns
│   ├── upload.md    # Content upload flow
│   ├── sync.md      # Synchronization flow
│   └── monitor.md   # Monitoring flow
├── states/          # System and resource states
│   ├── index.md     # State overview
│   ├── content.md   # Content lifecycle
│   ├── display.md   # Display node states
│   └── errors.md    # Error states and recovery
└── decisions/       # Architectural decisions
    ├── index.md     # Decision overview
    ├── hybrid.md    # Hybrid approach rationale
    ├── manifest.md  # Manifest design decisions
    └── status.md    # Status channel decisions
```

## Navigation

- Start with `actors/` to understand who uses the system
- Move to `resources/` to see what they interact with
- Check `interactions/` to understand how they work together
- Review `states/` to understand system behavior
- Examine `decisions/` to understand architectural choices
