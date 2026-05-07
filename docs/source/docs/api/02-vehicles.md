---
sidebar_position: 2
---

# Vehicles API

## POST /api/vehicles

Add a new vehicle to a parking lot.

### Headers

```
Authorization: Bearer <token>
```

### Body

```json
{
  "plate": "ABC123",
  "brand_id": 1,
  "model_id": 5,
  "version_id": 10,
  "year": 2024,
  "color_id": 3,
  "parking_lot_id": 2
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 42,
    "plate": "ABC123",
    "..."
  }
}
```

After success, backend emits `vehicle_added` to all clients.

---

## GET /api/vehicles/brands

Get all brands.

### Response

```json
[
  { "id": 1, "name": "Toyota" },
  { "id": 2, "name": "Ford" }
]
```

---

## GET /api/vehicles/models/:brand_id

Get models for a brand.

### Response

```json
[
  { "id": 5, "name": "Corolla" },
  { "id": 6, "name": "Camry" }
]
```

---

## GET /api/vehicles/versions/:model_id

Get versions for a model.

### Response

```json
[
  { "id": 10, "name": "SE" },
  { "id": 11, "name": "XSE" }
]
```

---

## GET /api/vehicles/prices/:version_id

Get prices for a version.

### Response

```json
[
  { "anio": 2024, "precio": 25000, "moneda": "USD" },
  { "anio": 2023, "precio": 22000, "moneda": "USD" }
]
```

---

## GET /api/vehicles/colors?q=...

Search colors by name.

### Response

```json
[
  { "id": 1, "name": "Red" },
  { "id": 2, "name": "Blue" }
]
```

---

## POST /api/vehicles/refresh-prices

Manually trigger ACARA PDF price update.

### Headers

```
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "count": 1234
}
```
