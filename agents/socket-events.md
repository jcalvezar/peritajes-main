# Socket Events Specification

## Overview

WebSocket communication using Socket.io. Real-time events for authentication and vehicle management.

## Connection

```typescript
// Client-side connection
const socket = io(BACKEND_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

---

## Client → Server Events

### `join_company`

**Purpose**: Authenticate socket connection and join company room.

**Payload**:
```typescript
interface IJoinCompanyPayload {
  token: string;  // JWT token
}
```

**Response** (`initial_data`):
```typescript
interface IInitialDataResponse {
  company: {
    id: number;
    name: string;
    tax_id?: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
    user_type: 'owner' | 'administrator' | 'regular';
    role_id?: number;
    role?: string;  // role name (e.g., "Gerente de Parkings")
  };
  parkingLots: {
    id: number;
    name: string;
    capacity: number;
  }[];
}
```

**Error Response** (`auth_error`):
```typescript
interface IAuthErrorResponse {
  error: 'No token provided' | 'Invalid token or DB error' | 'User not found';
}
```

**Behavior**:
1. Validates JWT token
2. Fetches company, user, and parking lots in parallel
3. Joins socket to room: `company_<company_id>`
4. Emits `initial_data` to the client

---

### `get_vehicles`

**Purpose**: Request list of all vehicles for the company.

**Payload**: None (uses socket's authenticated company_id)

**Response** (`vehicles_list`):
```typescript
interface IVehiclesListResponse {
  id: number;
  plate: string;
  brand_id?: number;
  model_id?: number;
  version_id?: number;
  color_id?: number;
  vin?: string;
  status: 'available' | 'maintenance' | 'reserved' | 'sold';
  company_id: number;
  parking_lot_id?: number;
  parking_lot_place?: string;
  // Join data (if included in query)
  brand_name?: string;
  model_name?: string;
  version_name?: string;
  color_name?: string;
  lot_name?: string;
}
```

**Error Response** (`auth_error`):
```typescript
{
  error: 'Error al obtener vehículos'
}
```

---

## Server → Client Events

### `initial_data`

**Direction**: Server → Client

**Trigger**: After successful `join_company`

**Payload**: See above (IInitialDataResponse)

---

### `vehicles_list`

**Direction**: Server → Client

**Trigger**: After `get_vehicles` event

**Payload**: Array of vehicle objects

---

### `vehicle_added`

**Direction**: Server → All clients in company room

**Trigger**: After successful vehicle creation via REST API

**Payload**:
```typescript
interface IVehicleAddedPayload {
  message: string;  // "Nuevo ingreso registrado"
  vehicle: {
    id: number;
    plate: string;
    brand_id: number;
    status: 'available';
    company_id: number;
    parking_lot_id: number;
    parking_lot_place: string;
    ...
  };
  user: string;  // username who added the vehicle
}
```

**Usage**: Updates vehicle list in real-time for all connected clients.

---

### `auth_error`

**Direction**: Server → Client

**Trigger**: Validation failure on `join_company` or `get_vehicles`

**Payload**:
```typescript
{
  error: string;
}
```

---

## Room Management

### Company Room

Each authenticated user joins a room named `company_<company_id>`:

```javascript
// Backend (authHandlers.js)
const roomName = utils.generateRoom(companyId);  // returns "company_1"
socket.join(roomName);
```

This allows broadcasting events to all users in the same company.

---

## Event Flow Diagrams

### Login Flow

```
Client                          Server
  │                                │
  │──── connect ─────────────────>│
  │                                │
  │<─── connection established ────│
  │                                │
  │──── join_company({token}) ────>│
  │                                │
  │    ┌──────────────────────┐    │
  │    │ Validate JWT         │    │
  │    │ Fetch Company        │    │
  │    │ Fetch User           │    │
  │    │ Fetch Parking Lots    │    │
  │    └──────────────────────┘    │
  │                                │
  │<─── initial_data({...}) ───────│
  │                                │
```

### Vehicle Addition Flow

```
Client A                        Server                         Client B
  │                              │                               │
  │──── POST /api/vehicles ────>│                               │
  │                              │                               │
  │<─── 201 Created ─────────────│                               │
  │                              │                               │
  │                              │──── vehicle_added ────────────│
  │                              │       ({...})                 │
```

---

## TypeScript Definitions

```typescript
// Socket events
interface SocketEvents {
  // Client → Server
  'join_company': (data: IJoinCompanyPayload) => void;
  'get_vehicles': () => void;
  
  // Server → Client
  'initial_data': (data: IInitialDataResponse) => void;
  'vehicles_list': (vehicles: IVehicle[]) => void;
  'vehicle_added': (data: IVehicleAddedPayload) => void;
  'auth_error': (data: IAuthErrorResponse) => void;
}
```

---

## Error Handling

| Error | Cause | Client Action |
|-------|-------|---------------|
| `No token provided` | Missing token in payload | Show login screen |
| `Invalid token or DB error` | Expired or malformed JWT | Re-authenticate |
| `User not found` | User deleted from DB | Show login screen |
| `Error al obtener vehículos` | DB query failed | Retry with backoff |

---

## Reconnection Strategy

```typescript
// Client-side
socket.on('connect', () => {
  const token = localStorage.getItem('token');
  if (token) {
    socket.emit('join_company', { token });
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```
