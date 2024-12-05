# Wrale Radiate ANDA Documentation

This documentation follows REST-like organization principles where actors, resources, and their interactions are first-class concepts.

## Structure

```
docs/anda/
├── README.md        # This overview document
├── actors/           # Each actor and their needs
│   └── README.md     # Actor definitions and needs
├── resources/       # System resources and their states
│   └── README.md     # Resource definitions and relationships
├── interactions/    # How actors interact with resources
│   └── README.md     # Interaction patterns and flows
├── states/          # System and resource states
│   └── README.md     # State definitions and transitions
└── decisions/       # Architectural decisions
    └── README.md     # Key decisions and rationale
```

## Navigation

1. [actors/](actors/) - Who uses the system and what they need
2. [resources/](resources/) - What they interact with
3. [interactions/](interactions/) - How they work together
4. [states/](states/) - System behavior and transitions
5. [decisions/](decisions/) - Why we built it this way

Each directory's README.md contains the complete documentation for that aspect of the system, maintaining a clear single-level hierarchy while preserving relationships between components.
