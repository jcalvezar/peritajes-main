# Project Architecture

## Overview

This project follows a microservices-like architecture with separate containers for the database, backend, and frontend.

## Git Workflow

**No commits or push directly to main.** Always create feature branches:
1. Create branch from main: `git checkout -b feature/description`
2. Commit and push changes
3. Create PR for review
4. After merge, switch to main and pull

## Containers

### 1. MySQL Database (`mysql_db`)
- **Image**: mysql:8
- **Port**: 3306
- **Purpose**: Persistent relational database
- **Network**: lioncars_net

### 2. phpMyAdmin (`phpmyadmin`)
- **Image**: phpmyadmin
- **Port**: Configured via `PHPMYADMIN_PORT` env var (default: 80)
- **Purpose**: Web interface for database administration
- **Network**: lioncars_net
- **Depends on**: mysql

### 3. Backend (`node_backend`)
- **Location**: `./backend/` (git submodule)
- **Framework**: Node.js with Express
- **Features**: REST API + WebSocket support
- **Port**: Configured via `BACKEND_PORT` env var
- **Purpose**: API layer that communicates with the database
- **Network**: lioncars_net
- **Depends on**: mysql (healthy)

### 4. Frontend (`next_frontend`)
- **Location**: `./frontend/` (git submodule)
- **Framework**: Next.js
- **Port**: Configured via `FRONTEND_PORT` env var
- **Purpose**: Web application that consumes the backend REST API and WebSocket
- **Network**: lioncars_net
- **Depends on**: backend

## Communication Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │──────│  Backend    │──────│    MySQL    │
│  (Next.js)  │◄────│  (Node.js)  │◄────│  Database  │
└─────────────┘      └─────────────┘      └─────────────┘
    Port: FRONTEND_PORT    Port: BACKEND_PORT    Port: 3306
```

1. **Frontend** (Next.js) communicates with **Backend** via REST API and WebSocket
2. **Backend** (Node.js) processes requests and interacts with **MySQL** database
3. All containers share the same Docker network (`lioncars_net`) for internal communication

## ACARA Parser

The parser is integrated into the **Backend** container. It parses the ACARA PDF (`./backend/data/acara_precios_autos.pdf`) to extract vehicle brands, models, versions, and prices.

### Database Tables

- `car_brands`: Vehicle brands
- `car_models`: Models per brand
- `car_versions`: Versions per model
- `car_prices`: Prices per version and year

### Usage

1. **Automatic**: Runs during `npm run seed` (or on first backend startup) to create tables and populate prices from ACARA PDF.

2. **Manual**: Via REST API endpoint:
   ```
   POST /api/vehicles/refresh-prices
   Header: Authorization: Bearer <token>
   ```

## Environment Variables

Key environment variables used for container configuration:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection
- `BACKEND_PORT`, `FRONTEND_PORT`: Service ports
- `BACKEND_URL`: Backend URL for frontend configuration
- `JWT_SECRET`: Authentication secret

## AI Assistant Rules

- **Never push directly to main.** Always create feature branches following the Git Workflow section above.