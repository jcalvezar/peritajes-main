---
sidebar_position: 1
---

# ACARA Parser

Extracts vehicle brands, models, versions, and prices from the ACARA PDF (Argentine automotive reference).

## Location

Backend container at `./backend/parser.js` (single file).

## Source PDF

`./backend/data/acara_precios_autos.pdf`

## Database Tables

| Table | Description |
|---|---|
| `car_brands` | Vehicle brands |
| `car_models` | Models per brand |
| `car_versions` | Versions per model |
| `car_prices` | Prices per version and year |

## Automatic Usage

Runs during seed (or first backend startup):

```bash
cd backend && npm run seed
```

## Manual Usage

Trigger via REST API:

```bash
POST /api/vehicles/refresh-prices
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "count": 1234
}
```
