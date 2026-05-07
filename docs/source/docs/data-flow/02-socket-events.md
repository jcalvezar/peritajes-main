---
sidebar_position: 2
---

# WebSocket Events

## Connection

```typescript
const socket = io(BACKEND_URL);
socket.emit("join_company", { token });
```

## Events

| Event | Payload | Triggered By | Redux Action |
|---|---|---|---|
| `initial_data` | `{company, parkingLots}` | After `join_company` | `setCompany`, `setParkingLots` |
| `vehicles_list` | `Vehicle[]` | After `join_company` | `setVehicles` |
| `vehicle_added` | `{vehicle, user}` | POST `/api/vehicles` | `addVehicle` |

## Rooms

Format: `company_{company_id}`

The backend extracts `company_id` from the JWT token and joins the socket to the appropriate room. All events are scoped to the room for data isolation between dealerships.

## SocketProvider

Lifecycle component that:

1. Creates socket when token is available
2. Emits `join_company` on connect
3. Listens for events and dispatches Redux actions
4. Disconnects on unmount (mobile) or persists (frontend)
