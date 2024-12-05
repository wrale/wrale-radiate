# Wrale Radiate ANDA Documentation

This documentation follows REST-like organization principles where actors, resources, and their interactions are first-class concepts.

## Structure

```
docs/anda/
├── README.md           # This overview document
├── actors/              # Each actor and their needs
│   ├── README.md        # Actor overview
│   ├── composer/        # Content composer actor
│   │   └── README.md   # Needs, constraints, success criteria
│   └── display/         # Display node actor
│       └── README.md   # Needs, constraints, success criteria
├── resources/          # System resources
│   ├── README.md        # Resource overview
│   ├── manifest/        # Content manifest resource
│   │   └── README.md   # Schema, states, validation
│   ├── content/         # Content resource
│   │   └── README.md   # Types, storage, delivery
│   └── status/          # Status resource
│       └── README.md   # Schema, updates, aggregation
├── interactions/       # How actors use resources
│   ├── README.md        # Interaction overview
│   ├── distribution/     # Content distribution flows
│   │   └── README.md   # Upload, delivery, caching
│   ├── monitoring/       # Status monitoring flows
│   │   └── README.md   # Reporting, aggregation
│   └── synchronization/  # Timing synchronization
│       └── README.md   # Mechanisms, adjustments
├── states/             # System states
│   ├── README.md        # State overview
│   ├── playback/        # Playback states
│   │   └── README.md   # Normal, error, recovery
│   └── deployment/      # Deployment states
│       └── README.md   # Upload, distribution, verify
└── decisions/          # Architectural decisions
    ├── README.md        # Decision overview
    ├── distribution/     # Content distribution choices
    │   └── README.md   # Why hybrid approach
    └── monitoring/       # Status monitoring choices
        └── README.md   # Why long-poll
```

## Navigation

1. [actors/](actors/) - Who uses the system and what they need
2. [resources/](resources/) - What they interact with
3. [interactions/](interactions/) - How they work together
4. [states/](states/) - System behavior and transitions
5. [decisions/](decisions/) - Why we built it this way

Each major concept has its own directory with a README.md providing an overview, and subdirectories for specific instances of that concept, each with their own README.md containing the details.