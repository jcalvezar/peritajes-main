---
sidebar_position: 2
---

# Redux Slices

## parkingLotsSlice

Manages parking lots and vehicles (shared between frontend and mobile).

### State

```typescript
interface Vehicle {
  id: number;
  plate: string;
  brand_id: number;
  model_id: number;
  version_id: number;
  year: number;
  color_id: number;
  parking_lot_id: number;
}

interface ParkingLot {
  id: number;
  name: string;
  capacity: number;
}
```

### Actions

| Action | Payload | Description |
|---|---|---|
| `setParkingLots` | `ParkingLot[]` | Replace all parking lots |
| `setVehicles` | `Vehicle[]` | Replace all vehicles |
| `addVehicle` | `Vehicle` | Append vehicle (triggered by WebSocket) |
| `updateVehicle` | `Vehicle` | Update vehicle by id |
| `removeVehicle` | `number` | Remove vehicle by id |
| `clearParkingLots` | — | Clear on logout |

## authSlice

Manages authentication state.

### State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserPayload | null;
  company: Company | null;
}
```

### Actions

| Action | Payload | Description |
|---|---|---|
| `login` | `{token, user}` | Set auth state |
| `logout` | — | Clear auth and company |
| `setCompany` | `Company` | Set company (from WebSocket initial_data) |
| `initialize` | `{user, token}` | SSR hydration (frontend only) |
