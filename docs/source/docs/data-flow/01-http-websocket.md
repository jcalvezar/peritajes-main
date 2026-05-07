---
sidebar_position: 1
---

# HTTP POST + WebSocket Flow

All create/update operations follow a consistent pattern:

1. **Client sends POST** to REST API
2. **Backend persists** to database
3. **Backend emits** WebSocket event to all clients in `company_{company_id}` room
4. **Clients receive** event and dispatch Redux action

## Example: Add Vehicle

```
Frontend/Mobile ─POST /api/vehicles─► Backend
                                          │
                                          ▼
                                    INSERT into DB
                                          │
                                          ▼
                              Emit "vehicle_added" event
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
               Client 1              Client 2              Client N
          dispatch addVehicle     dispatch addVehicle    dispatch addVehicle
```

## Why Not PUT/DELETE?

Updates and deletes also use POST. The actual mutation is communicated via WebSocket events, so the HTTP verb is less important than the event-driven update mechanism. This simplifies the API surface while keeping all clients in sync.
