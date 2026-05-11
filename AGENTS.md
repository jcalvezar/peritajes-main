# Project Architecture

## Overview

This project follows a microservices-like architecture with separate containers for the database, backend, and frontend.

## Git Workflow

**No commits or push directly to main.** Always create feature branches:
1. Create branch from main: `git checkout -b feature/description`
2. Commit and push changes
3. Create PR for review
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

The system is divided into 3 paid, independent modules. Access to each module is granted based on the dealership's subscription, and only subscribed modules are displayed in both the mobile app and frontend:

### 1. Parkings
Manages vehicle depositories and the vehicles stored in each depository. Includes ABM (Add, Edit, Delete) of parkings, ABM of vehicles in parkings, and parking listings.

### 2. Reservas
Manages vehicle reservations: customers indicate vehicles they want that are not yet available in the dealership. Includes ABM of reservations and reservation listings.

### 3. Peritajes
Manages used vehicle inspections (checks for engine, paint, tires, interior, etc.). Includes ABM of vehicles to inspect, inspection execution, and inspection approval.

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
- [ ] Actualizar doc parser: cambiar `./backend/parser/` por `./backend/parser.js` (archivo único)

### Backend
- [ ] **Fix `sockets/utils.js`**: Cambiar `export const generateRoom` (ES module) a `module.exports = { generateRoom }` (CommonJS). El resto del backend usa CommonJS y esto rompe en runtime.
- [ ] Actualizar doc data-flow/socket-events: en `join_company` solo se envían los parkings (no los vehicles). Los vehicles se piden y emiten (`vehicles_list`) cuando el usuario accede al módulo "Parkings". El comportamiento actual del backend es correcto, la doc está desactualizada.

### Frontend
- [ ] Crear página de Reservas (`/reservations/page.tsx`) con ABM y listado de reservas
- [ ] Crear página de Peritajes (`/inspections/page.tsx`) con ABM, ejecución y aprobación de peritajes
- [ ] Crear página de Parkings (`/parkings/page.tsx`) con ABM de parkings y vehicles
- [ ] **Fix Dashboard**: Eliminar datos hardcodeados ("Local Central", "Depósito 1", "Depósito 2"). Usar datos reales del backend vía socket.
- [ ] **Crear wrapper hooks** `useAuth()` y `useParking()` (frontend y app-mobile) para evitar usar `useAppSelector`/`useAppDispatch` directamente en los componentes. Deben ser compartidos/consistentes entre ambos.

### App-mobile
- [ ] **Fix `doLogin` thunk**: Tipar correctamente el dispatch con `AppDispatch` en `authSlice.ts` para eliminar el `as any` en `LoginScreen.tsx`. También agregar tipo `PayloadAction<boolean>` a `setDarkMode` en `themeSlice.ts`.
- [x] **Crear store Redux** (parkingSlice, authSlice, index, hooks) - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Crear ParkingForm.js** - Modal para ABM de parking lots - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Crear VehicleForm.js** - Modal para ABM de vehículos - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Actualizar ParkingContext.tsx** - ADD/UPDATE/REMOVE parking lot + REMOVE/UPDATE vehicle - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Actualizar SocketContext.tsx** - parking_added/updated/deleted, vehicle_updated/deleted listeners - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Actualizar Parking.js** - Botones edit/delete funcionales con API calls - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Actualizar Parkings.js** - FAB conectado a ParkingForm, empty state - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Actualizar App.tsx** - ReduxProvider agregado - ✅ COMPLETADO 2026-05-11 10:10
- [x] **Arreglar localization** - Fix duplicado parkings key en es.js + nuevos strings - ✅ COMPLETADO 2026-05-11 10:10

### General (Frontend + App-mobile)
- [ ] **Consistencia Redux**: Los slices y hooks de Redux deben ser iguales tanto en la app-mobile como en el frontend. Al crear o modificar slices/hooks, verificar que ambas plataformas mantengan la misma estructura y nombres. Esto debe documentarse en la doc de state-management.

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

## TO DO

### 1. Cambiar nombres de módulos a inglés (No modificar i18n) ✅ COMPLETADO

**Módulos a cambiar:**
- `Reservas` → `Reservations`
- `Peritajes` → `Inspections`
- `Parkings` ya está en inglés (mantener)

**Archivos modificados (excluyendo i18n):**

| Archivo | Cambio |
|---------|--------|
| `README.md` (root) | Descripciones de módulos |
| `frontend/README.md` | Descripciones de módulos |
| `backend/README.md` | Referencias a módulos |
| `backend/seed.js` | Nombres en DB: `reservas` → `reservations`, `peritajes` → `inspections` |
| `frontend/src/store/reservasSlice.ts` | Renombrado a `reservationsSlice.ts` |
| `frontend/src/store/peritajesSlice.ts` | Renombrado a `inspectionsSlice.ts` |
| `frontend/src/store/index.ts` | Actualizar imports y reducers |

### 2. Reemplazar Contexts por Redux slices ✅ COMPLETADO

**Contexts migrados:**
- `AuthContext.tsx` → creado `authSlice.ts`
- `ThemeContext.tsx` → creado `themeSlice.ts`
- `SocketProvider.tsx` → actualizado para usar Redux

**Pasos completados:**

1. **Creado `authSlice.ts`** con:
   - State: `isAuthenticated`, `user`, `token`, `company`
   - Actions: `login()`, `logout()`, `setCompany()`, `setInitialAuth()`
   - Persistencia en localStorage

2. **Creado `themeSlice.ts`** con:
   - State: `isDarkMode`
   - Actions: `toggleDarkMode()`, `setDarkMode()`
   - Persistencia en localStorage

3. **Actualizado `store/index.ts`** para incluir nuevos slices

4. **Modificado `LayoutContent.tsx`** para:
   - Eliminar `CustomThemeProvider` y `AuthProvider`
   - Usar Redux hooks directamente
   - Simplificar jerarquía: `ReduxProvider` → `SocketProvider` → children

5. **Eliminados archivos:**
   - `frontend/src/context/AuthContext.tsx` ✅
   - `frontend/src/context/ThemeContext.tsx` ✅

6. **Actualizados componentes** que usaban `useAuth()` y `useTheme()` para usar `useAppSelector/useAppDispatch`:
   - `ProtectedDrawer.tsx`
   - `ProtectedNavbar.tsx`
   - `ProtectedFooter.tsx`
   - `ThemeSwitcher.tsx`
   - `users/page.tsx`
   - `roles/page.tsx`
   - `login/page.tsx`
   - `SocketProvider.tsx`
   - `layout.tsx` (locale)

### 3. Revisar documentación vs implementación

**Verificado:**
- ✅ Docs referencian `authSlice.ts` → **Creado en paso 2**
- ✅ Docs usan nombres "Parking", "Reservations", "Inspections" → **Alineado en paso 1**
- ⚠️ Interfaces incompletas en `reservationsSlice.ts` e `inspectionsSlice.ts` → **Pendiente completar**
- ⚠️ Fuentes markdown de docs no existen en repo (`docs/docs/` vacío) → **Notificar al usuario**

**Pendiente:**
- Completar interfaces `Reservation` e `Inspection` en slices
- Crear archivos markdown fuente para documentación en `docs/docs/`

### Orden de ejecución completado:

1. ✅ Cambiar nombres de módulos (excluyendo i18n) - **MERGED TO MAIN**
2. ✅ Crear slices de Redux para Auth y Theme - **MERGED TO MAIN**
3. ✅ Refactorizar providers/layout para usar Redux - **MERGED TO MAIN**
4. ✅ Eliminar Contexts - **MERGED TO MAIN**
5. ⚠️ Verificar alineación con docs (parcial)

---

## Implementación: Módulo Parkings

### Análisis - Backend

| Componente | Estado | Archivo |
|------------|--------|---------|
| Controller | ❌ No existe | `controllers/parkingController.js` |
| Routes | ❌ No existe | `routes/parkingRoutes.js` |
| Registro en server.js | ❌ Falta | - |
| Validación permisos | ❌ No hay | - |

**Endpoints REST faltantes:**
- `GET /api/parkings` - Listar todos de la empresa
- `POST /api/parkings` - Crear nuevo
- `GET /api/parkings/:id` - Ver uno
- `PUT /api/parkings/:id` - Editar
- `DELETE /api/parkings/:id` - Eliminar

**Socket events a emitir:**
- `parking_added`
- `parking_updated`
- `parking_deleted`

### Análisis - Frontend

| Componente | Estado | Archivo |
|------------|--------|---------|
| Página `/parkings` | ❌ No existe | `src/app/[locale]/(protected)/parkings/page.tsx` |
| Componente ParkingForm | ❌ No existe | - |
| Componente VehicleForm | ❌ No existe | - |
| Slice: addParkingLot | ❌ Falta | `store/parkingLotsSlice.ts` |
| Slice: updateParkingLot | ❌ Falta | `store/parkingLotsSlice.ts` |
| Slice: removeParkingLot | ❌ Falta | `store/parkingLotsSlice.ts` |
| Link en navegación | ❌ No hay | `ProtectedDrawer.tsx` |

### Análisis - App-mobile

| Componente | Estado | Archivo |
|------------|--------|---------|
| ParkingForm modal | ❌ No existe | `src/components/parkings/ParkingForm.js` |
| VehicleForm modal | ❌ No existe | `src/components/parkings/VehicleForm.js` |
| ParkingContext: CRUD | ❌ Falta | `ParkingContext.tsx` |
| Socket: parking_added/updated/deleted | ❌ Falta | `SocketContext.tsx` |
| Botones edit/delete funcionales | ❌ No implementados | `Parking.js` |

---

### Orden de implementación

#### Fase 1: Backend
1. ✅ `backend/controllers/parkingController.js`
2. ✅ `backend/routes/parkingRoutes.js`
3. ✅ `backend/server.js` - Registrar routes
4. ✅ Emitir socket events

#### Fase 2: Frontend
5. ✅ `parkingLotsSlice.ts` - Agregar thunks CRUD
6. ✅ `parkings/page.tsx` - Página completa
7. ⏳ `ParkingForm.tsx` - Formulario ABM (integrado en página)
8. ⏳ `VehicleForm.tsx` - Formulario ABM vehicles (pendiente)
9. ✅ `ProtectedDrawer.tsx` - Link a Parkings

#### Fase 3: App-mobile
10. ✅ `ParkingContext.tsx` - Agregar acciones CRUD (ADD/UPDATE/REMOVE parking lot + REMOVE/UPDATE vehicle)
11. ✅ `ParkingForm.js` - Modal ABM de parking lots (creado real)
12. ✅ `VehicleForm.js` - Modal ABM de vehículos (creado real)
13. ✅ `Parkings.js` - Conectar FAB + empty state + ParkingForm integrado
14. ✅ `Parking.js` - Implementar botones edit/delete funcionales (con delete via API y onEdit callback)
15. ✅ `SocketContext.tsx` - Agregar listeners socket (parking_added/updated/deleted, vehicle_updated/deleted)
16. ✅ `store/` - Redux store creado (index.ts, hooks.ts, parkingSlice.ts, authSlice.ts)
17. ✅ `App.tsx` - ReduxProvider agregado
18. ✅ `localization/` - Fix duplicado parkings key + nuevos strings
19. ✅ **Eliminados AuthContext y ParkingContext** - Redux es ahora el único estado global. SocketContext ya no es un Context, solo un componente que usa Redux hooks. App.tsx simplificado a ReduxProvider → SocketProvider → NavigationContainer

---

### Referencias

Ver specs detalladas en `agents/`:
- [agents/database.md](./agents/database.md)
- [agents/parkings.md](./agents/parkings.md)
- [agents/api-rest.md](./agents/api-rest.md)
- [agents/socket-events.md](./agents/socket-events.md)
- [agents/state-management.md](./agents/state-management.md)

---

## Sitio Web Público (Landing Page)

Crear un sitio web público que sea una réplica de https://meucci.com.ar

**Objetivo:** Presentar la empresa y el producto a potenciales clientes.

**Características a replicar:**
- Diseño corporativo profesional
- Secciones: Inicio, Nosotros, Servicios, Contacto
- Catalogo de vehiculos (datos de ACARA)
- Formulario de contacto
- Responsive design

**Tech stack:**
- Next.js (misma estructura que frontend existente)
- O puede ser un proyecto separado

**TODO:**
- [ ] Crear página principal pública
- [ ] Diseñar layout y componentes
- [ ] Integrar catálogo de vehículos (datos de ACARA)
- [ ] Agregar formulario de contacto
- [ ] SEO y metadata