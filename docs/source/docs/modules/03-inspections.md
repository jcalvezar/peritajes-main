---
sidebar_position: 3
---

# Inspections Module

Manages used vehicle inspections. Covers engine, paint, tires, interior, and other checks.

## Features

- **ABM of Vehicles to Inspect** — Add, edit, and delete pending inspections
- **Inspection Execution** — Perform inspections with detailed checks
- **Inspection Approval** — Approve or reject inspection results

## Flow

```
POST /api/peritajes ──► Create inspection ──► Backend emits event via socket ──► All clients update Redux state
```
