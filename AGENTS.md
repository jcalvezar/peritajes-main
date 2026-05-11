# Project Architecture

## Overview

This project follows a microservices-like architecture with separate containers for the database, backend, and frontend.

## Git Workflow

**No commits or push directly to main.** Always create feature branches:
1. Create branch from main: `git checkout -b feature/description`
2. Commit and push changes
3. **`gh` command is NOT available in this environment.** Do NOT attempt to install it or use the GitHub API directly. Instead, provide the PR creation link to the user (printed by `git push` output: `https://github.com/*/pull/new/<branch>`).
4. After merge, switch to main and pull

## Containers

### 1. MySQL Database (`mysql_db`)
- **Image**: mysql:8
- **Port**: 3306
- **Purpose**: Persistent relational database
- **Network**: lioncars_net

### 2. phpMyAdmin (`phpmyadmin`)
- **Image**: phpmyadmin
- **Port**: Configured via `PHPMYADMIN_PORT` env var (default: 80)
- **Purpose**: Web interface for database administration
- **Network**: lioncars_net
- **Depends on**: mysql

### 3. Backend (`node_backend`)
- **Location**: `./backend/` (git submodule)
- **Framework**: Node.js with Express
- **Features**: REST API + WebSocket support
- **Port**: Configured via `BACKEND_PORT` env var
- **Purpose**: API layer that communicates with the database
- **Network**: lioncars_net
- **Depends on**: mysql (healthy)

### 4. Frontend (`next_frontend`)
- **Location**: `./frontend/` (git submodule)
- **Framework**: Next.js
- **Port**: Configured via `FRONTEND_PORT` env var
- **Purpose**: Web application that consumes the backend REST API and WebSocket
- **Network**: lioncars_net
- **Depends on**: backend

## Communication Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │──────│  Backend    │──────│    MySQL    │
│  (Next.js)  │◄────│  (Node.js)  │◄────│  Database  │
└─────────────┘      └─────────────┘      └─────────────┘
    Port: FRONTEND_PORT    Port: BACKEND_PORT    Port: 3306
```

1. **Frontend** (Next.js) communicates with **Backend** via REST API and WebSocket
2. **Backend** (Node.js) processes requests and interacts with **MySQL** database
3. All containers share the same Docker network (`lioncars_net`) for internal communication

## System Modules

| Module | English Name | Description |
|--------|-------------|-------------|
| Parkings | Parkings | Vehicle depositories & stored vehicles (ABM + listings) |
| Reservas | Reservations | Vehicle reservation management (ABM + listings) |
| Peritajes | Inspections | Used vehicle inspections (ABM + execution + approval) |

## User Roles and Permissions

### Owner
The user who registered and created the dealership, responsible for all module payments. Permissions:
- Create administrator users for their dealership
- Create custom roles and assign specific permissions (e.g., ABM of parkings, ABM of vehicles in parkings, parking listings, ABM of reservations, reservation listings, ABM of vehicles to inspect, inspection execution, inspection approval) to each role **within their dealership only**
- Full access to all subscribed modules
- Cannot be edited or deleted by administrators
- Roles created by an Owner are scoped to their dealership and do not affect other dealerships

### Administrators
Created by the Owner. Permissions:
- Full access to all subscribed modules and features **within their dealership**, except:
  - Modifying, editing, or deleting the Owner
  - Changing payment/subscription settings
  - Creating or editing roles (only Owner can do this)
- Create regular users and assign existing roles (defined by the Owner for their dealership)

### Regular Users
Created by administrators, assigned roles defined by the Owner. Permissions:
- Access only the modules and features granted by their assigned role
- Only see tabs/sections corresponding to their permissions (e.g., a user with only parking permissions cannot see Reservas or Peritajes tabs)

## ACARA Parser

The parser is integrated into the **Backend** container. It parses the ACARA PDF (`./backend/data/acara_precios_autos.pdf`) to extract vehicle brands, models, versions, and prices.

### Database Tables

- `car_brands`: Vehicle brands
- `car_models`: Models per brand
- `car_versions`: Versions per model
- `car_prices`: Prices per version and year

### Usage

1. **Automatic**: Runs during `npm run seed` (or on first backend startup) to create tables and populate prices from ACARA PDF.

2. **Manual**: Via REST API endpoint:
   ```
   POST /api/vehicles/refresh-prices
   Header: Authorization: Bearer <token>
   ```

## Environment Variables

Key environment variables used for container configuration:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection
- `BACKEND_PORT`, `FRONTEND_PORT`: Service ports
- `BACKEND_URL`: Backend URL for frontend configuration
- `JWT_SECRET`: Authentication secret

## TO-DO List

### Docs
- [ ] Fix doc parser ruta: cambiar `./backend/parser/` → `./backend/parser.js`
- [ ] Actualizar doc socket-events: `join_company` solo envía parkings (no vehicles)

### Backend
- [ ] **Fix `sockets/utils.js`**: Cambiar `export const generateRoom` a `module.exports = { generateRoom }` (CommonJS)

### Frontend
- [ ] Crear página de Reservas (`/reservations/page.tsx`)
- [ ] Crear página de Peritajes (`/inspections/page.tsx`)
- [ ] **Fix Dashboard**: eliminar datos hardcodeados, usar datos reales vía socket
- [ ] **Crear wrapper hooks** `useAuth()` y `useParking()` para no usar `useAppSelector`/`useAppDispatch` directo

### App-mobile
- [ ] **Fix `doLogin` thunk**: tipar dispatch con `AppDispatch`, sacar `as any`
- [ ] **Fix `setDarkMode`**: agregar tipo `PayloadAction<boolean>`

### General
- [ ] **Consistencia Redux**: slices/hooks deben ser iguales en frontend y app-mobile
- [ ] **Landing Page**: sitio web público (replica de meucci.com.ar)

## AI Assistant Rules

### Git Workflow

- **Never work on main.** Always create feature branches following the Git Workflow section above. Never create features or fixes directly on main.
- **On feature branches you CAN make commits and push.** Unlike the previous rule, you are allowed to commit and push directly to feature branches. The user only handles the PR merge.
- **Always pull main (or the base branch) in the target repository before creating a feature branch.** This includes submodules — if working on a submodule, pull main there first too. This prevents merge conflicts in PRs.
- **If git pull fails**, show the user which files are causing the problem and ask what to do before taking any action. Do not reset or clean without user permission.

### File Integrity

- **Never delete or modify git hooks.** Specifically, never delete or modify the `pre-push` hook in `.git/hooks/` or `.git/modules/*/hooks/`. If a git operation is blocked by a hook, ask the user for guidance instead of bypassing or removing the hook.
- **Never modify or delete the .env file.** The .env file contains critical environment variables and must not be altered.

### Code Quality

- **Unit tests required.** For every code change (new feature, refactor, or fix), create or update corresponding unit tests. Tests must pass before considering the change complete.
- **Update AGENTS.md after each change.** After completing any task, update AGENTS.md to reflect the change with timestamp (YYYY-MM-DD HH:mm). Then ask user if changes should be pushed. If yes: create branch, commit, push, show PR link. User handles PR, merge, etc.

### App Behavior

- **When sign in is successful**, the app shows parkings and vehicles. Use real data from backend via socket, not hardcoded data.

## Change Log

| Date | Change | Files |
|------|--------|-------|
| 2026-05-11 00:30 | Spec files created in `agents/` | agents/*.md |
| 2026-05-11 01:00 | Backend: Parking CRUD implemented | parkingController.js, parkingRoutes.js, server.js |
| 2026-05-11 01:15 | Frontend: Parkings page + slice CRUD | parkings/page.tsx, parkingLotsSlice.ts, ProtectedDrawer.tsx |
| 2026-05-11 01:30 | App-mobile: Parking CRUD + socket handlers (marcado, no implementado) | ParkingContext.tsx, SocketContext.tsx, ParkingForm.js, Parking.js, Parkings.js |
| 2026-05-11 10:10 | App-mobile: Implementación real módulo Parkings | store/*, ParkingForm.js, VehicleForm.js, ParkingContext.tsx, SocketContext.tsx, Parking.js, Parkings.js, App.tsx, localization/* |
| 2026-05-11 10:15 | App-mobile: Eliminados contexts, Redux único estado global | App.tsx, authSlice.ts, SocketContext.tsx, Parkings.js, LoginScreen.tsx, LogoutScreen.js |
| 2026-05-11 11:00 | App-mobile: CRUD completo Parkings (desde main limpio) | parkingSlice.ts, SocketContext.tsx, ParkingForm.js, VehicleForm.js, Parking.js, Parkings.tsx, localization/* |
| 2026-05-11 11:30 | Backend: Tests parking controller (100% coverage) | __tests__/controllers.test.js |
| 2026-05-11 11:45 | App-mobile: Tests Redux slices (100% coverage) | src/store/__tests__/*.test.ts |
| 2026-05-11 12:00 | Frontend: Tests Redux slices (parking + auth) | src/store/__tests__/*.test.ts |
| 2026-05-11 12:30 | Branch cleanup + submodule sync | AGENTS.md |

