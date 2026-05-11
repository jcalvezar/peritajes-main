# State Management Specification

## Overview

State management for two platforms:
- **Frontend (Next.js)**: Redux Toolkit
- **App-mobile (React Native)**: Context API (pending migration to Redux)

Goal: Consistent state structure across both platforms.

---

## Frontend (Redux)

### Store Structure

```
store/
├── index.ts           # Configure store with all reducers
├── hooks.ts           # Typed hooks (useAppSelector, useAppDispatch)
├── authSlice.ts       # Authentication state
├── themeSlice.ts      # Theme (dark mode) state
├── parkingLotsSlice.ts # Parking lots and vehicles
├── reservationsSlice.ts # Reservations
├── inspectionsSlice.ts  # Inspections
├── usersSlice.ts      # Users CRUD
└── rolesSlice.ts      # Roles CRUD
```

### Auth Slice

```typescript
// authSlice.ts
interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    user_type: 'owner' | 'administrator' | 'regular';
    role_id?: number;
    role?: string;
  } | null;
  company: {
    id: number;
    name: string;
    tax_id?: string;
  } | null;
}

// Actions
- login(credentials) → AsyncThunk
- logout() → Reducer
- setCompany(company) → Reducer
- setInitialAuth({ token, user, company }) → Reducer (from localStorage)
```

**Persistence**: `token` stored in localStorage, restored on app load.

### Theme Slice

```typescript
// themeSlice.ts
interface IThemeState {
  isDarkMode: boolean;
}

// Actions
- toggleDarkMode() → Reducer
- setDarkMode(boolean) → Reducer
```

**Persistence**: `isDarkMode` stored in localStorage.

### Parking Lots Slice

```typescript
// parkingLotsSlice.ts
interface IParkingLotsState {
  parkingLots: IParkingLot[];
  vehicles: IVehicle[];
  loading: boolean;
  error: string | null;
}

// Actions
- fetchParkingLots() → AsyncThunk
- fetchVehicles(filters?) → AsyncThunk
- addVehicle(data) → AsyncThunk
- updateVehicle(id, data) → AsyncThunk
- deleteVehicle(id) → AsyncThunk
- setSelectedLot(lot) → Reducer
- socketVehicleAdded(vehicle) → Reducer
- socketVehicleUpdated(vehicle) → Reducer
- socketVehicleDeleted(id) → Reducer
```

### Reservations Slice

```typescript
// reservationsSlice.ts
interface IReservationsState {
  reservations: IReservation[];
  loading: boolean;
  error: string | null;
  currentReservation: IReservation | null;
  filters: { status?: string; search?: string };
  pagination: { page: number; total: number; pages: number };
}

// Actions
- fetchReservations(filters?) → AsyncThunk
- createReservation(data) → AsyncThunk
- updateReservation(id, data) → AsyncThunk
- deleteReservation(id) → AsyncThunk
- setFilters(filters) → Reducer
- setCurrentReservation(reservation) → Reducer
```

### Inspections Slice

```typescript
// inspectionsSlice.ts
interface IInspectionsState {
  inspections: IInspection[];
  loading: boolean;
  error: string | null;
  currentInspection: IInspection | null;
  filters: { status?: string; vehicle_id?: number };
}

// Actions
- fetchInspections(filters?) → AsyncThunk
- createInspection(data) → AsyncThunk
- updateInspection(id, data) → AsyncThunk
- deleteInspection(id) → AsyncThunk
- executeInspection(id, results) → AsyncThunk
- approveInspection(id, notes) → AsyncThunk
- rejectInspection(id, notes) → AsyncThunk
- setCurrentInspection(inspection) → Reducer
```

---

## App-mobile (React Native)

### Current Structure (Context API)

```
contexts/
├── AuthContext.tsx    # Auth state
├── ParkingContext.tsx # Parking state with useReducer
└── SocketContext.tsx  # Socket connection

hooks/
├── useAuth.ts         # useAuth hook
├── useParkingCtx.ts   # useParkingCtx hook
└── useSocketCtx.ts    # useSocketCtx hook
```

### Pending: Migration to Redux

Goal: Match frontend Redux structure.

**Proposed Slices**:
- `authSlice.ts` - Identical to frontend
- `parkingSlice.ts` - Identical to frontend
- `reservationsSlice.ts` - Identical to frontend
- `inspectionsSlice.ts` - Identical to frontend

---

## Cross-Platform Consistency

### Type Definitions

All types should be identical across platforms.

```typescript
// types/index.ts (shared)
export enum UserType {
  Owner = 'owner',
  Administrator = 'administrator',
  Regular = 'regular'
}

export enum VehicleStatus {
  Available = 'available',
  Maintenance = 'maintenance',
  Reserved = 'reserved',
  Sold = 'sold'
}

export enum ReservationStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Fulfilled = 'fulfilled',
  Cancelled = 'cancelled'
}

export enum InspectionStatus {
  Scheduled = 'scheduled',
  InProgress = 'in_progress',
  PendingApproval = 'pending_approval',
  Approved = 'approved',
  Rejected = 'rejected'
}

export interface ICompany { ... }
export interface IUser { ... }
export interface IParkingLot { ... }
export interface IVehicle { ... }
export interface IReservation { ... }
export interface IInspection { ... }
```

### Action Naming

| Action | Frontend | App-mobile |
|--------|----------|------------|
| Login | `login` | `login` |
| Logout | `logout` | `logout` |
| Fetch lots | `fetchParkingLots` | `fetchParkingLots` |
| Add vehicle | `addVehicle` | `addVehicle` |
| Update vehicle | `updateVehicle` | `updateVehicle` |
| Delete vehicle | `deleteVehicle` | `deleteVehicle` |

---

## Selector Patterns

### Frontend

```typescript
// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectCompany = (state: RootState) => state.auth.company;
export const selectParkingLots = (state: RootState) => state.parkingLots.parkingLots;
export const selectVehicles = (state: RootState) => state.parkingLots.vehicles;
```

### App-mobile (when migrated)

```typescript
// Same selectors, adapted for Context
export const useIsAuthenticated = () => {
  const { state } = useAuthContext();
  return state.isAuthenticated;
};
```

---

## Middleware

### Redux Persist (Frontend)

```typescript
// store/index.ts
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme']  // Only persist auth and theme
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer)
});

export const persistor = persistStore(store);
```

### App-mobile Async Storage

```typescript
// Use @react-native-async-storage/async-storage
// Match Redux persist configuration
```

---

## Wrapped Hooks (TODO)

Create wrapper hooks to abstract Redux/Context:

```typescript
// hooks/useAuth.ts (shared)
export const useAuth = () => {
  #if WEB
    return {
      isAuthenticated: useAppSelector(selectIsAuthenticated),
      user: useAppSelector(selectUser),
      login: useCallback((creds) => dispatch(login(creds)), [dispatch]),
      logout: useCallback(() => dispatch(logout()), [dispatch]),
    };
  #else
    return useAuthContext();  // Context for RN
  #endif
};
```

**Status**: Pending implementation (see AGENTS.md TODO)
