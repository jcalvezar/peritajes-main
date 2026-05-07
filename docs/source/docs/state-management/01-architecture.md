---
sidebar_position: 1
---

# State Management Architecture

Both frontend (Next.js) and mobile app (React Native) use **Redux Toolkit** as the single source of truth for application state.

## Core Principles

- **No redundant Contexts** — Components use `useAppSelector`/`useAppDispatch` or wrapper hooks like `useAuth()`/`useParking()`
- **Shared slice definitions** — Slices follow consistent patterns across platforms
- **Socket events dispatch directly to Redux** — Real-time updates flow through the store

## Store Structure

```
src/store/
├── index.ts          # configureStore
├── hooks.ts          # Typed useAppDispatch, useAppSelector
├── authSlice.ts      # Authentication state
├── parkingLotsSlice.ts # Parking lots and vehicles
├── reservationsSlice.ts # Reservations
├── inspectionsSlice.ts  # Inspections
├── rolesSlice.ts     # User roles
├── usersSlice.ts     # User management
└── themeSlice.ts     # Dark/light mode
```

## Wrapper Hooks

Thin wrapper hooks replace Context providers:

- `useAuth()` — Reads auth state from Redux, dispatches auth actions
- `useParking()` — Reads parking state from Redux

This avoids the boilerplate of Context + Provider + useContext.

## Socket Integration

`SocketProvider` is a lifecycle component only — it manages the WebSocket connection and dispatches events to Redux.

```
connect → emit "join_company" → receive "initial_data" → dispatch → components re-render
```
