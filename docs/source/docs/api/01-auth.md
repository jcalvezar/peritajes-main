---
sidebar_position: 1
---

# Authentication API

## POST /api/auth/login

Authenticate user and receive JWT token.

### Request

```json
{
  "username": "user@example.com",
  "password": "secret"
}
```

### Response (Success)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company_id": 1
  }
}
```

### Response (Error)

```json
{
  "error": "Invalid credentials"
}
```
