---
sidebar_position: 3
---

# Custom Hooks

## useAuth()

Reads authentication state from Redux and provides auth actions.

### Returns

| Property | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `token` | `string \| null` | JWT token |
| `user` | `object \| null` | User object |
| `company` | `{id, name} \| null` | Current company |
| `login(email, password)` | `Promise<void>` | Authenticate user |
| `logout()` | `void` | Clear auth and parking state |
| `setCompany(company)` | `void` | Set current company |

## useParking()

Reads parking state from Redux.

### Returns

| Property | Type | Description |
|---|---|---|
| `lots` | `ParkingLot[]` | All parking lots |
| `vehicles` | `Vehicle[]` | All vehicles |

## useAppSelector() / useAppDispatch()

Typed Redux hooks for direct store access.

```typescript
import { useAppSelector, useAppDispatch } from "./store/hooks";

const dispatch = useAppDispatch();
const { lots } = useAppSelector((state) => state.parkingLots);
```
