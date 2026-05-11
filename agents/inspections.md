# Inspections Module Specification

## Overview

Manages used vehicle inspections (peritajes). Includes ABM of vehicles to inspect, inspection execution (checking engine, paint, tires, interior, etc.), and inspection approval.

## Entities

### Inspection

Represents a vehicle inspection (peritaje).

```typescript
interface IInspection {
  id: number;
  vehicle_id: number;
  inspector_id: number;        // user who performs inspection
  approver_id?: number;          // user who approved
  status: InspectionStatus;
  scheduled_date: Date;
  executed_at?: Date;
  approved_at?: Date;
  // Vehicle details (join)
  plate?: string;
  brand_name?: string;
  model_name?: string;
  version_name?: string;
  // Inspection results
  results?: IInspectionResults;
  notes?: string;
  company_id: number;
  created_at: Date;
  updated_at: Date;
}

interface IInspectionResults {
  engine: ICheckItem;
  exterior: ICheckItem;
  interior: ICheckItem;
  tires: ICheckItem;
  electrical: ICheckItem;
  documentation: ICheckItem;
  overall_score?: number;       // 0-100
}

interface ICheckItem {
  status: 'pass' | 'fail' | 'pending';
  notes?: string;
  photos?: string[];            // URLs to photos
}
```

---

## States

### Inspection Status Flow

```
scheduled ──> in_progress ──> pending_approval ──> approved
                                     │
                                     └──> rejected
```

| Status | Description | Color (UI) |
|--------|-------------|------------|
| scheduled | Inspection scheduled, not started | gray |
| in_progress | Inspection being performed | blue |
| pending_approval | Inspection complete, awaiting approval | yellow |
| approved | Inspection approved by manager/owner | green |
| rejected | Inspection rejected, needs rework | red |

---

## Inspection Checklist

### Engine
- [ ] Oil level and condition
- [ ] Coolant level
- [ ] Battery condition
- [ ] belts and hoses
- [ ] Leaks
- [ ] Starting performance

### Exterior
- [ ] Paint condition
- [ ] Dents and scratches
- [ ] Rust
- [ ] Lights and signals
- [ ] Glass and mirrors
- [ ] Bumpers

### Interior
- [ ] Seats condition
- [ ] Dashboard
- [ ] Air conditioning
- [ ] Heating
- [ ] Electronics
- [ ] Upholstery

### Tires
- [ ] Front left tread
- [ ] Front right tread
- [ ] Rear left tread
- [ ] Rear right tread
- [ ] Spare tire
- [ ] Jack and tools

### Electrical
- [ ] Battery
- [ ] Alternator
- [ ] Lights (all)
- [ ] Signals
- [ ] Horn
- [ ] Navigation system

### Documentation
- [ ] Registration
- [ ] Insurance
- [ ] Service history
- [ ] Title
- [ ] Previous inspections

---

## API Endpoints

### GET /api/inspections

**Auth Required**: Yes

**Description**: List all inspections for company.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| vehicle_id | number | Filter by vehicle |
| date_from | date | Start date filter |
| date_to | date | End date filter |

**Response (200)**:
```json
{
  "inspections": [
    {
      "id": 1,
      "plate": "AB123CD",
      "brand_name": "Toyota",
      "model_name": "Hilux",
      "status": "pending_approval",
      "scheduled_date": "2025-01-20T09:00:00Z",
      "inspector_name": "Carlos",
      "overall_score": 85
    }
  ]
}
```

### GET /api/inspections/:id

**Auth Required**: Yes

**Description**: Get full inspection details with results.

### POST /api/inspections

**Auth Required**: Yes (vehicle_to_inspect_abm permission)

**Description**: Schedule new inspection.

**Request Body**:
```json
{
  "vehicle_id": 5,
  "scheduled_date": "2025-01-25T10:00:00Z",
  "notes": "Cliente interesado en trade-in"
}
```

### PUT /api/inspections/:id

**Auth Required**: Yes

**Description**: Update inspection (execute or update results).

**Request Body (execute inspection)**:
```json
{
  "status": "in_progress",
  "results": {
    "engine": { "status": "pass", "notes": "Excelente estado" },
    "exterior": { "status": "fail", "notes": "Rayón en puerta trasera" },
    "interior": { "status": "pass" },
    "tires": { "status": "pass" },
    "electrical": { "status": "pass" },
    "documentation": { "status": "pass" },
    "overall_score": 88
  }
}
```

**Request Body (submit for approval)**:
```json
{
  "status": "pending_approval",
  "notes": "Inspección completada. Rayón menor en puerta."
}
```

### PUT /api/inspections/:id/approve

**Auth Required**: Yes (inspection_approve permission)

**Description**: Approve inspection.

**Request Body**:
```json
{
  "notes": "Aprobado para stock"
}
```

### PUT /api/inspections/:id/reject

**Auth Required**: Yes (inspection_approve permission)

**Description**: Reject inspection with reason.

**Request Body**:
```json
{
  "notes": "Revisar tema de documentación faltante"
}
```

### DELETE /api/inspections/:id

**Auth Required**: Yes (vehicle_to_inspect_abm permission)

**Description**: Delete inspection (only if scheduled).

---

## WebSocket Events

### `inspection_created`

**Direction**: Server → All clients in company

**Payload**:
```typescript
{
  message: "Nueva inspección programada",
  inspection: IInspection,
  user: string
}
```

### `inspection_started`

**Payload**:
```typescript
{
  message: "Inspección iniciada",
  inspection_id: number,
  inspector: string
}
```

### `inspection_submitted`

**Payload**:
```typescript
{
  message: "Inspección lista para aprobación",
  inspection: IInspection,
  user: string
}
```

### `inspection_approved`

**Payload**:
```typescript
{
  message: "Inspección aprobada",
  inspection: IInspection,
  approver: string
}
```

### `inspection_rejected`

**Payload**:
```typescript
{
  message: "Inspección rechazada",
  inspection: IInspection,
  reason: string
}
```

---

## UI Components

### InspectionCard

```tsx
interface InspectionCardProps {
  inspection: IInspection;
  onView: (id: number) => void;
  onExecute?: (id: number) => void;
  onApprove?: (id: number) => void;
}
```

**States:**
- scheduled: Gray badge, "Programar" button
- in_progress: Blue badge, "Continuar" button
- pending_approval: Yellow badge, "Revisar" + "Aprobar/Rechazar" buttons
- approved: Green badge, "Ver" button
- rejected: Red badge, "Revisar" button

### InspectionForm

**Sections:**
1. Vehicle Info (readonly)
2. Checklist (expandable per section)
3. Photos (upload)
4. Notes
5. Overall Score

### ScoreGauge

Visual representation of overall score:
- 0-40: Red (needs attention)
- 41-70: Yellow (acceptable)
- 71-100: Green (good)

---

## Permissions

| Permission | Description |
|------------|-------------|
| vehicle_to_inspect_abm | Schedule and delete inspections |
| inspection_execute | Perform inspection (fill checklist) |
| inspection_approve | Approve or reject inspections |

---

## Redux State (Frontend)

```typescript
// inspectionsSlice.ts
interface IInspectionsState {
  inspections: IInspection[];
  loading: boolean;
  error: string | null;
  currentInspection: IInspection | null;
  filters: {
    status?: InspectionStatus;
    vehicle_id?: number;
  };
}
```
