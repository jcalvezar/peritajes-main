---
sidebar_position: 1
---

# Parking Module

Manages vehicle depositories and the vehicles stored in each depository.

## Features

- **ABM of Parking Lots** — Add, edit, and delete parking lots
- **ABM of Vehicles** — Add, edit, and delete vehicles within lots
- **Parking Listings** — View all lots and their contents

## Data Types

```typescript
interface ParkingLot {
  id: number;
  name: string;
  capacity: number;
}

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
```

## Flow

```
POST /api/parkings ──► Create parking lot
POST /api/vehicles ──► Add vehicle ──► Backend emits "vehicle_added" via socket ──► All clients update Redux state
```
