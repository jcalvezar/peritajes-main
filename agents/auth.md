# Authentication Specification

## Overview

JWT-based authentication with role-based access control (RBAC). Users authenticate once and receive a token for subsequent requests.

## Authentication Flow

```
┌──────────┐    Login    ┌──────────┐    Validate    ┌──────────┐
│  Client  │────────────>│  Backend │───────────────>│   DB    │
│          │<─────────── │          │<───────────────│         │
└──────────┘   JWT Token  └──────────┘   User+Role    └──────────┘
      │                                     │
      │    REST API + Socket                │
      │    (Authorization: Bearer <token>)   │
      └─────────────────────────────────────┘
```

## JWT Token Structure

### Payload
```typescript
interface ITokenPayload {
  id: number;         // user_id
  company_id: number;  // company identifier
  user_type: 'owner' | 'administrator' | 'regular';
  iat: number;        // issued at
  exp: number;        // expiration timestamp
}
```

### Token Configuration
- **Algorithm**: HS256
- **Expiration**: 7 days (604800 seconds)
- **Secret**: `process.env.JWT_SECRET`

### Token Generation (Backend)
```javascript
const token = jwt.sign(
  { id: user.id, company_id: user.company_id, user_type: user.user_type },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## User Types & Permissions

### User Types Hierarchy

```
Owner (user_type = 'owner')
  ├── Cannot be edited or deleted
  ├── Manages payment/subscription settings
  ├── Creates administrators
  └── Creates roles with permissions

Administrator (user_type = 'administrator')
  ├── Cannot modify Owner
  ├── Cannot change subscription settings
  ├── Cannot create/edit roles (only Owner)
  └── Creates regular users

Regular (user_type = 'regular')
  └── Access based on assigned role permissions
```

### Permission Matrix

| Permission | Owner | Admin | Regular (role) |
|------------|-------|-------|----------------|
| company.view | ✅ | ✅ | ✅ |
| user.abm | ✅ | ✅ | ❌ |
| role.abm | ✅ | ❌ | ❌ |
| subscription.manage | ✅ | ❌ | ❌ |
| module.parkings | ✅ | ✅ | Based on role |
| module.reservations | ✅ | ✅ | Based on role |
| module.inspections | ✅ | ✅ | Based on role |

---

## API Endpoints

### POST /api/auth/login

**Description**: Authenticate user and receive JWT token.

**Request Body**:
```typescript
interface ILoginRequest {
  email: string;    // or username
  password: string;
}
```

**Response (200 OK)**:
```typescript
interface ILoginResponse {
  success: true;
  token: string;           // JWT token
  user: {
    id: number;
    username: string;
    email: string;
    user_type: UserType;
    company_id: number;
    role_id?: number;
    role?: string;         // role name
  };
}
```

**Response (401 Unauthorized)**:
```typescript
interface ILoginError {
  success: false;
  error: string;  // "Invalid credentials" | "User not found"
}
```

**Example**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juanca@jca.com", "password": "Test123!"}'
```

---

## WebSocket Events

### Client → Server

#### `join_company`
Authenticates socket connection and joins company room.

**Payload**:
```typescript
interface IJoinCompanyPayload {
  token: string;  // JWT token
}
```

**Response** (`initial_data`):
```typescript
interface IInitialDataResponse {
  company: ICompany;
  user: {
    id: number;
    username: string;
    email: string;
    user_type: UserType;
    role_id?: number;
    role?: string;  // role name
  };
  parkingLots: IParkingLot[];
}
```

**Error Response** (`auth_error`):
```typescript
interface IAuthErrorResponse {
  error: string;  // "No token provided" | "Invalid token" | "User not found"
}
```

---

## Middleware

### REST API Authentication

```javascript
// backend/middlewares/authMiddleware.js
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Permission Check

```typescript
// frontend/src/hooks/usePermission.ts
const checkPermission = (userType: UserType, permission: string): boolean => {
  if (userType === 'owner') return true;
  if (userType === 'administrator' && permission !== 'subscription.manage' && permission !== 'role.abm') return true;
  // Regular users check role_permissions table
  return false;
};
```

---

## State Management

### Frontend (Redux)

**authSlice.ts**:
```typescript
interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    user_type: UserType;
    role_id?: number;
    role?: string;
  } | null;
  company: ICompany | null;
}
```

**Actions**:
- `login(credentials)` → dispatches async thunk
- `logout()` → clears state and localStorage
- `setCompany(company)` → sets company in state
- `setInitialAuth({ token, user, company })` → restores from storage

---

## Security Rules

1. **Password Storage**: bcrypt with salt rounds = 10
2. **Token Expiration**: 7 days (require re-login after expiry)
3. **Socket Validation**: Every socket event validates JWT on `join_company`
4. **Company Isolation**: All queries include `company_id` filter
5. **Owner Protection**: Cannot be modified/deleted via API
6. **Role Scoping**: Roles belong to company that created them

---

## Login States

| State | UI | Description |
|-------|-----|-------------|
| idle | Login form | Initial state |
| loading | Spinner + disabled form | Submitting credentials |
| success | Redirect to dashboard | Token received |
| error | Error message | Invalid credentials or server error |

### UI States

**Loading**:
```typescript
// Form inputs disabled, spinner shown
<Button type="submit" disabled>
  <CircularProgress size={20} /> Ingresando...
</Button>
```

**Error**:
```typescript
// Error message displayed below form
<Alert severity="error">
  Credenciales inválidas. Verifique email y contraseña.
</Alert>
```

**Success**:
```typescript
// Token stored, redirect to protected route
localStorage.setItem('token', response.token);
router.push('/dashboard');
```
