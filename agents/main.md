# Lion Cars - Project Specifications

## Overview

This document contains the comprehensive specifications for the Lion Cars dealership management system. These specs follow the **Spec-Driven Development** approach where specifications serve as the single source of truth.

## Spec Files

### ✅ Core Specifications (Complete)

| File | Status | Description |
|------|--------|-------------|
| [database.md](./database.md) | ✅ | MySQL data models, tables, relationships |
| [auth.md](./auth.md) | ✅ | Login, JWT, roles, permissions |
| [api-rest.md](./api-rest.md) | ✅ | REST API endpoints |
| [socket-events.md](./socket-events.md) | ✅ | WebSocket events |

### ✅ Module Specifications (Complete)

| File | Status | Description |
|------|--------|-------------|
| [parkings.md](./parkings.md) | ✅ | Parking lots and vehicles management |
| [reservations.md](./reservations.md) | ✅ | Vehicle reservations |
| [inspections.md](./inspections.md) | ✅ | Vehicle inspections (peritajes) |

### ✅ UI/State Specifications (Complete)

| File | Status | Description |
|------|--------|-------------|
| [ui-components.md](./ui-components.md) | ✅ | Shared UI components |
| [state-management.md](./state-management.md) | ✅ | Redux slices and Context consistency |
| [i18n.md](./i18n.md) | ✅ | Internationalization keys |

---

## Spec File Structure

Each spec follows this structure:

```markdown
# [Module Name]

## TypeScript Interfaces
- Entity definitions with types

## States
- All possible states and transitions

## API Endpoints
- REST endpoints with request/response examples

## Socket Events
- Client↔Server events with payloads

## UI States
- Loading, empty, error, success states
```

---

## Naming Conventions

### Types & Interfaces
- PascalCase
- Prefix with `I` for interfaces: `IUser`, `IVehicle`

### Enums
- PascalCase with values as PascalCase: `UserType.Owner`

### File Names
- Slices: `{module}Slice.ts`
- Hooks: `use{Module}.ts`
- Components: `{ComponentName}.tsx`
- Pages: `page.tsx`

---

## System Modules

1. **Parkings** - Vehicle depositories and stored vehicles
2. **Reservations** - Customer vehicle reservations
3. **Inspections** - Used vehicle inspection (peritajes)

---

## Architecture

```
Frontend (Next.js) ←→ Backend (Node.js) ←→ MySQL
     ↑                      ↑
     └────── WebSocket ─────┘
```

---

## TODO (for spec evolution)

- [ ] Add database migration scripts
- [ ] Add API response examples with full payloads
- [ ] Add mobile-specific UI specs
- [ ] Add testing specifications
- [ ] Add deployment configuration specs
