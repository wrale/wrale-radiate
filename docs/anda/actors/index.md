# Actors

## Overview
Actors are entities that interact with the system. Each actor has specific needs, constraints, and success criteria.

## Primary Actors

### [Content Composer](composer.md)
Responsible for content management and system monitoring.

### [Display Node](display.md)
Responsible for content playback and status reporting.

## Actor Relationships

- Content Composer ←(manages)→ Content
- Content ←(played by)→ Display Node
- Content Composer ←(monitors)→ Display Node
