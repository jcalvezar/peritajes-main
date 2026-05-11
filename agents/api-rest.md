# REST API Specification

## Overview

REST API built with Express.js. All endpoints (except login) require JWT authentication via `Authorization: Bearer <token>` header.

## Base URL

```
Development: http://localhost:4000/api
Production: http://backend:4000/api (Docker internal)
```

## Authentication

### POST /api/auth/login

**Auth Required**: No

**Request Body**:
```json
{
  "username": "juanca@jca.com",
  "password": "Test123!"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "username": "juanca",
    "user_type": "owner",
    "role_id": null,
    "role": null
  }
}
```

**Error (401)**:
```json
{
  "error": "Usuario o contraseña incorrectos"
}
```

---

## Users

### GET /api/users

**Auth Required**: Yes

**Description**: Get all users for the current company.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response (200)**:
```json
{
  "users": [
    {
      "id": 1,
      "username": "juanca",
      "email": "juanca@jca.com",
      "user_type": "owner",
      "company_id": 1,
      "role_id": null
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

---

### POST /api/users

**Auth Required**: Yes (owner/administrator only)

**Description**: Create a new user.

**Request Body**:
```json
{
  "username": "newadmin",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "user_type": "administrator",
  "role_id": 1
}
```

**Response (201)**:
```json
{
  "success": true,
  "user": { "id": 2, "username": "newadmin", ... }
}
```

---

### PUT /api/users/:id

**Auth Required**: Yes

**Description**: Update user details.

**Request Body**:
```json
{
  "email": "newemail@example.com",
  "role_id": 2
}
```

**Response (200)**:
```json
{
  "success": true,
  "user": { "id": 2, "email": "newemail@example.com", ... }
}
```

---

### DELETE /api/users/:id

**Auth Required**: Yes (owner only)

**Description**: Delete a user. Cannot delete owner.

**Response (200)**:
```json
{
  "success": true,
  "message": "User deleted"
}
```

**Error (400)**:
```json
{
  "error": "Cannot delete owner"
}
```

---

## Roles

### GET /api/roles

**Auth Required**: Yes

**Description**: Get all roles for the current company.

**Response (200)**:
```json
{
  "roles": [
    {
      "id": 1,
      "company_id": 1,
      "name": "Gerente de Parkings",
      "description": "Acceso completo a parkings",
      "created_by": 1,
      "created_at": "2025-01-15T10:00:00Z",
      "permissions": ["parking_abm", "vehicle_in_parking_abm", "parking_list"]
    }
  ]
}
```

---

### POST /api/roles

**Auth Required**: Yes (owner only)

**Description**: Create a new role with permissions.

**Request Body**:
```json
{
  "name": "Visualizador de Parkings",
  "description": "Solo puede ver parkings",
  "permissions": ["parking_list"]
}
```

**Response (201)**:
```json
{
  "success": true,
  "role": { "id": 2, "name": "Visualizador de Parkings", ... }
}
```

---

### PUT /api/roles/:id

**Auth Required**: Yes (owner only)

**Description**: Update role and its permissions.

**Request Body**:
```json
{
  "name": "Nuevo nombre",
  "description": "Nueva descripción",
  "permissions": ["parking_abm", "parking_list"]
}
```

---

### DELETE /api/roles/:id

**Auth Required**: Yes (owner only)

**Description**: Delete a role.

---

## Vehicles

### GET /api/vehicles/brands

**Auth Required**: Yes

**Description**: Get all car brands.

**Response (200)**:
```json
[
  { "id": 1, "name": "Toyota" },
  { "id": 2, "name": "Renault" }
]
```

---

### GET /api/vehicles/models/:brand_id

**Auth Required**: Yes

**Description**: Get models for a specific brand.

**Response (200)**:
```json
[
  { "id": 1, "name": "Hilux" },
  { "id": 2, "name": "Corolla" }
]
```

---

### GET /api/vehicles/versions/:model_id

**Auth Required**: Yes

**Description**: Get versions for a specific model.

**Response (200)**:
```json
[
  { "id": 1, "name": "SRX 4x4" },
  { "id": 2, "name": "DX 4x2" }
]
```

---

### GET /api/vehicles/prices/:version_id

**Auth Required**: Yes

**Description**: Get prices for a specific version.

**Response (200)**:
```json
[
  { "anio": 2025, "precio": 45000.00, "moneda": "USD" },
  { "anio": 2024, "precio": 42000.00, "moneda": "USD" }
]
```

---

### GET /api/vehicles/colors

**Auth Required**: Yes

**Query Params**:
| Param | Description |
|-------|-------------|
| q | Search filter (optional) |

**Response (200)**:
```json
[
  { "id": 1, "name": "Blanco" },
  { "id": 2, "name": "Negro" }
]
```

---

### POST /api/vehicles

**Auth Required**: Yes

**Description**: Add a new vehicle to inventory.

**Request Body**:
```json
{
  "plate": "AB123CD",
  "brand_id": 1,
  "model_id": 1,
  "version_id": 1,
  "color": "Blanco",
  "vin": "9B12345678901234",
  "parking_lot_id": 1,
  "parking_lot_place": "A00001"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "plate": "AB123CD",
    "brand_id": 1,
    "status": "available",
    ...
  }
}
```

**Side Effect**: Emits `vehicle_added` socket event to all users in the company room.

---

### POST /api/vehicles/refresh-prices

**Auth Required**: Yes (owner/administrator)

**Description**: Re-parse ACARA PDF and update car prices.

**Response (200)**:
```json
{
  "success": true,
  "count": 150
}
```

---

## Error Responses

All endpoints return errors in this format:

| Status | Meaning | Response |
|--------|---------|----------|
| 400 | Bad Request | `{ "error": "Validation message" }` |
| 401 | Unauthorized | `{ "error": "No token provided" }` |
| 403 | Forbidden | `{ "error": "Permission denied" }` |
| 404 | Not Found | `{ "error": "Resource not found" }` |
| 500 | Server Error | `{ "error": "Internal server error" }` |

---

## Common Headers

**Request**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response**:
```
Content-Type: application/json
```
