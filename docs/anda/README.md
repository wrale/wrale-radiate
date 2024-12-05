# Wrale Radiate ANDA Documentation

This documentation focuses on the core steel thread of the Wrale Radiate system.

## Steel Thread Definition

The steel thread represents the minimal viable path for content to flow from creation to display with confirmation:

1. Store an asset
2. Get it to a display
3. Show it correctly
4. Know if it worked

## Core Components

### Actors
- Marketing Team (MKTG) - Creates and manages content
- Basic Display (DISPLAY_BASIC) - Shows content
- IT Operations (IT_OPS) - Monitors system health

### Needs
- Content Management (MKTG_CONTENT_MGMT) - Upload and organize content
- Basic Rendering (DISP_BASIC_RENDER) - Show content on displays
- Display Health (DISP_BASIC_HEALTH) - Report display status
- Basic Monitoring (IT_HEALTH_BASIC) - Monitor overall system health

### Capabilities
- Asset Library (CAP_ASSET_LIB) - Store and organize content
- Content Transport (CAP_CONTENT_TRANSPORT) - Move content to displays
- Basic Renderer (CAP_BASIC_RENDER) - Display content
- Health Monitor (CAP_DISPLAY_HEALTH) - Track status

## Implementation Focus

1. Each component should be implemented in its simplest viable form
2. Avoid premature optimization or unnecessary complexity
3. Focus on establishing the basic content flow before adding features
4. Health monitoring should confirm only basic content delivery and display

## Directory Structure

```
docs/anda/
├── README.md           # This overview
├── actors/            # Core actor documentation
│   ├── marketing.md   # Marketing team needs
│   ├── display.md     # Display needs
│   └── it-ops.md     # IT operations needs
├── capabilities/      # Core capability documentation
│   ├── asset-lib.md   # Asset library 
│   ├── transport.md   # Content transport
│   ├── renderer.md    # Basic renderer
│   └── health.md      # Health monitoring
└── decisions/        # Key architectural decisions
    └── steel-thread.md # Why these components
```

Each component documentation focuses only on what's needed for the steel thread functionality.