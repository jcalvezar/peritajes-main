# Reservations Module Specification

## Overview

Manages vehicle reservations: customers indicate vehicles they want that are not yet available in the dealership. Includes ABM (Add, Edit, Delete) of reservations and reservation listings.

## Entities

### Reservation

Represents a customer's vehicle reservation request.

```typescript
interface IReservation {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  vehicle_brand_id?: number;
  vehicle_model_id?: number;
  vehicle_version_id?: number;
  color_preference?: string;
  status: ReservationStatus;
  notes?: string;
  company_id: number;
  created_by: number;       // user who created
  created_at: Date;
  updated_at: Date;
  // Join data
  brand_name?: string;
  model_name?: string;
  version_name?: string;
}
```

---

## States

### Reservation Status Flow

```
pending ──────> confirmed ──────> fulfilled
    │                │
    │                └──> cancelled
    │
    └──> cancelled
```

| Status | Description | Color (UI) |
|--------|-------------|------------|
| pending | New reservation, awaiting confirmation | yellow |
| confirmed | Customer confirmed, vehicle being sourced | blue |
| fulfilled | Vehicle delivered/assigned | green |
| cancelled | Reservation cancelled | red |

---

## API Endpoints

### GET /api/reservations

**Auth Required**: Yes (reservation_list permission)

**Description**: List all reservations for company.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| page | number | Pagination |
| limit | number | Items per page |

**Response (200)**:
```json
{
  "reservations": [
    {
      "id": 1,
      "customer_name": "Juan Pérez",
      "customer_email": "juan@email.com",
      "customer_phone": "+5491112345678",
      "brand_name": "Toyota",
      "model_name": "Hilux",
      "version_name": "SRX 4x4",
      "color_preference": "Negro",
      "status": "pending",
      "notes": "Cliente prefiere color negro",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

### GET /api/reservations/:id

**Auth Required**: Yes

**Description**: Get reservation details.

### POST /api/reservations

**Auth Required**: Yes (reservation_abm permission)

**Description**: Create new reservation.

**Request Body**:
```json
{
  "customer_name": "María García",
  "customer_email": "maria@email.com",
  "customer_phone": "+5491155551234",
  "vehicle_brand_id": 1,
  "vehicle_model_id": 1,
  "vehicle_version_id": 1,
  "color_preference": "Blanco",
  "notes": "Primera compra en la concesionaria"
}
```

**Response (201)**:
```json
{
  "success": true,
  "reservation": {
    "id": 26,
    "customer_name": "María García",
    "status": "pending",
    "created_at": "2025-01-15T14:00:00Z"
  }
}
```

### PUT /api/reservations/:id

**Auth Required**: Yes (reservation_abm permission)

**Description**: Update reservation status or details.

**Request Body**:
```json
{
  "status": "confirmed",
  "notes": "Cliente confirmado, vehículo en tránsito"
}
```

**Status Transitions:**
- `pending` → `confirmed` | `cancelled`
- `confirmed` → `fulfilled` | `cancelled`
- `cancelled` → (terminal state)
- `fulfilled` → (terminal state)

### DELETE /api/reservations/:id

**Auth Required**: Yes (reservation_abm permission)

**Description**: Delete reservation (only if not fulfilled).

---

## WebSocket Events

### `reservation_created`

**Direction**: Server → All clients in company

**Trigger**: POST /api/reservations succeeds

**Payload**:
```typescript
{
  message: "Nueva reserva creada",
  reservation: IReservation,
  user: string
}
```

### `reservation_updated`

**Direction**: Server → All clients in company

**Trigger**: PUT /api/reservations/:id succeeds

**Payload**:
```typescript
{
  message: string,
  reservation: IReservation,
  user: string
}
```

### `reservation_deleted`

**Direction**: Server → All clients in company

**Trigger**: DELETE /api/reservations/:id succeeds

**Payload**:
```typescript
{
  message: "Reserva eliminada",
  reservation_id: number,
  user: string
}
```

---

## UI States

### Reservation List

| State | UI |
|-------|-----|
| loading | Table skeleton with status column |
| empty | "No hay reservas" + Create button |
| filtered | Status filter chips (pending, confirmed, etc.) |
| success | Table with customer, vehicle specs, status badge |

### Reservation Form

| State | UI |
|-------|-----|
| idle | Empty form with customer + vehicle sections |
| vehicle_select | Cascading selects: Brand → Model → Version |
| submitting | Spinner on submit |
| success | Toast + redirect to list |
| error | Field errors + server message |

### Status Badge Colors

| Status | Background | Text |
|--------|------------|------|
| pending | warning.light | warning.dark |
| confirmed | info.light | info.dark |
| fulfilled | success.light | success.dark |
| cancelled | error.light | error.dark |

---

## Permissions

| Permission | Description |
|------------|-------------|
| reservation_abm | Create, edit, delete reservations |
| reservation_list | View reservation list |

---

## Redux State (Frontend)

```typescript
// reservationsSlice.ts
interface IReservationsState {
  reservations: IReservation[];
  loading: boolean;
  error: string | null;
  currentReservation: IReservation | null;
  filters: {
    status?: ReservationStatus;
    search?: string;
  };
  pagination: {
    page: number;
    total: number;
    pages: number;
  };
}
```

**Actions:**
- `fetchReservations(filters?)` - Thunk to get list
- `fetchReservation(id)` - Thunk for single
- `createReservation(data)` - Thunk to create
- `updateReservation(id, data)` - Thunk to update
- `deleteReservation(id)` - Thunk to delete
- `setFilters(filters)` - Update filter state
- `setCurrentReservation(reservation)` - Set active
