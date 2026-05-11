# Parkings Module Specification

## Overview

Manages vehicle depositories (parking lots) and the vehicles stored in each depository. Includes ABM (Add, Edit, Delete) operations for parkings and vehicles.

## Entities

### ParkingLot

Represents a physical or logical parking area.

```typescript
interface IParkingLot {
  id: number;
  name: string;
  capacity: number;
  company_id: number;
}
```

**Constraints:**
- Name: 1-100 characters, required
- Capacity: Default 50, minimum 1, maximum 999
- company_id: Required, must belong to user's company

### Vehicle

Represents a vehicle stored in a parking lot.

```typescript
interface IVehicle {
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
  // Join data (from queries)
  brand_name?: string;
  model_name?: string;
  version_name?: string;
  color_name?: string;
  lot_name?: string;
}
```

**Constraints:**
- plate: 1-20 characters, required, unique per company
- vin: 17 characters (optional, for full VIN validation)
- parking_lot_place: 1-20 characters (e.g., "A00001")

---

## States

### Parking Lot States

| State | Description |
|-------|-------------|
| active | Parking lot is operational |
| inactive | Parking lot is disabled (soft delete) |

### Vehicle States

| State | Description | Color (UI) |
|-------|-------------|------------|
| available | Ready for sale or assignment | green |
| maintenance | In repair or service | orange |
| reserved | Reserved by customer | blue |
| sold | Already sold/delivered | gray |

---

## API Endpoints

### Parking Lots

#### GET /api/parkings

**Auth Required**: Yes

**Description**: List all parking lots for company.

**Response (200)**:
```json
{
  "parkingLots": [
    { "id": 1, "name": "North Depot", "capacity": 60, "company_id": 1 },
    { "id": 2, "name": "Pacheco Plant", "capacity": 60, "company_id": 1 }
  ]
}
```

#### POST /api/parkings

**Auth Required**: Yes (parking_abm permission)

**Description**: Create new parking lot.

**Request Body**:
```json
{
  "name": "New Depot",
  "capacity": 50
}
```

**Response (201)**:
```json
{
  "success": true,
  "parkingLot": { "id": 3, "name": "New Depot", "capacity": 50, "company_id": 1 }
}
```

#### PUT /api/parkings/:id

**Auth Required**: Yes (parking_abm permission)

**Description**: Update parking lot.

**Request Body**:
```json
{
  "name": "Updated Depot",
  "capacity": 75
}
```

#### DELETE /api/parkings/:id

**Auth Required**: Yes (parking_abm permission)

**Description**: Delete parking lot (cascade vehicles or require empty).

---

### Vehicles

#### GET /api/vehicles

**Auth Required**: Yes

**Description**: List all vehicles with optional filters.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| parking_lot_id | number | Filter by lot |
| status | string | Filter by status |
| plate | string | Search by plate |

**Response (200)**:
```json
{
  "vehicles": [
    {
      "id": 1,
      "plate": "AB123CD",
      "brand_name": "Toyota",
      "model_name": "Hilux",
      "version_name": "SRX 4x4",
      "color_name": "Blanco",
      "status": "available",
      "lot_name": "North Depot",
      "parking_lot_place": "A00001"
    }
  ]
}
```

#### GET /api/vehicles/:id

**Auth Required**: Yes

**Description**: Get vehicle details.

#### POST /api/vehicles

**Auth Required**: Yes (vehicle_in_parking_abm permission)

**Description**: Add vehicle to inventory.

**Request Body**:
```json
{
  "plate": "XY789ZW",
  "brand_id": 1,
  "model_id": 1,
  "version_id": 1,
  "color": "Negro",
  "vin": "9B12345678901234",
  "parking_lot_id": 1,
  "parking_lot_place": "B00015"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": 16,
    "plate": "XY789ZW",
    "status": "available",
    ...
  }
}
```

**Side Effect**: Emits `vehicle_added` to company room.

#### PUT /api/vehicles/:id

**Auth Required**: Yes (vehicle_in_parking_abm permission)

**Description**: Update vehicle (location, status, details).

**Request Body**:
```json
{
  "parking_lot_id": 2,
  "parking_lot_place": "C00020",
  "status": "maintenance"
}
```

#### DELETE /api/vehicles/:id

**Auth Required**: Yes (vehicle_in_parking_abm permission)

**Description**: Remove vehicle from inventory.

---

## WebSocket Events

### `vehicles_list`

**Direction**: Server → Client

**Trigger**: Client emits `get_vehicles`

**Payload**: Array of IVehicle objects

### `vehicle_added`

**Direction**: Server → All clients in company

**Trigger**: POST /api/vehicles succeeds

**Payload**:
```typescript
{
  message: "Nuevo ingreso registrado",
  vehicle: IVehicle,
  user: string  // username
}
```

### `vehicle_updated`

**Direction**: Server → All clients in company

**Trigger**: PUT /api/vehicles/:id succeeds

**Payload**:
```typescript
{
  message: "Vehículo actualizado",
  vehicle: IVehicle,
  user: string
}
```

### `vehicle_deleted`

**Direction**: Server → All clients in company

**Trigger**: DELETE /api/vehicles/:id succeeds

**Payload**:
```typescript
{
  message: "Vehículo eliminado",
  vehicle_id: number,
  user: string
}
```

---

## UI States

### Parking List

| State | UI |
|-------|-----|
| loading | Skeleton cards with spinner |
| empty | "No hay depósitos. Creá el primero." + Add button |
| error | Alert with retry button |
| success | Grid/list of parking cards |

### Vehicle List

| State | UI |
|-------|-----|
| loading | Table skeleton rows |
| empty | "No hay vehículos en este depósito." |
| filtered | Active filters shown as chips |
| success | Data table with actions |

### Add Vehicle Form

| State | UI |
|-------|-----|
| idle | Empty form with required fields marked |
| selecting | Brand/Model/Version cascading selects |
| ready | All fields filled, submit enabled |
| submitting | Spinner on submit button, form disabled |
| success | Toast + redirect to list |
| error | Error message + field highlights |

---

## Permissions

| Permission | Description |
|------------|-------------|
| parking_abm | Create, edit, delete parking lots |
| vehicle_in_parking_abm | Create, edit, delete vehicles |
| parking_list | View parking lots and vehicles |

---

## Redux State (Frontend)

```typescript
// parkingLotsSlice.ts
interface IParkingLotsState {
  parkingLots: IParkingLot[];
  vehicles: IVehicle[];
  loading: boolean;
  error: string | null;
  selectedLot: IParkingLot | null;
}
```

**Actions:**
- `fetchParkingLots()` - Thunk to get lots
- `fetchVehicles(filters?)` - Thunk to get vehicles
- `addVehicle(data)` - Thunk to add vehicle
- `updateVehicle(id, data)` - Thunk to update
- `deleteVehicle(id)` - Thunk to delete
- `setSelectedLot(lot)` - Set active lot
- `socketVehicleAdded(vehicle)` - Handle socket event
- `socketVehicleUpdated(vehicle)` - Handle socket event
