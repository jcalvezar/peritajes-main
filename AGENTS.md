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

## System Modules

The system is divided into 3 paid, independent modules. Access to each module is granted based on the dealership's subscription, and only subscribed modules are displayed in both the mobile app and frontend:

### 1. Parkings
Manages vehicle depositories and the vehicles stored in each depository. Includes ABM (Add, Edit, Delete) of parkings, ABM of vehicles in parkings, and parking listings.

### 2. Reservas
Manages vehicle reservations: customers indicate vehicles they want that are not yet available in the dealership. Includes ABM of reservations and reservation listings.

### 3. Peritajes
Manages used vehicle inspections (checks for engine, paint, tires, interior, etc.). Includes ABM of vehicles to inspect, inspection execution, and inspection approval.

## User Roles and Permissions

### Owner
The user who registered and created the dealership, responsible for all module payments. Permissions:
- Create administrator users for their dealership
- Create custom roles and assign specific permissions (e.g., ABM of parkings, ABM of vehicles in parkings, parking listings, ABM of reservations, reservation listings, ABM of vehicles to inspect, inspection execution, inspection approval) to each role **within their dealership only**
- Full access to all subscribed modules
- Cannot be edited or deleted by administrators
- Roles created by an Owner are scoped to their dealership and do not affect other dealerships

### Administrators
Created by the Owner. Permissions:
- Full access to all subscribed modules and features **within their dealership**, except:
  - Modifying, editing, or deleting the Owner
  - Changing payment/subscription settings
  - Creating or editing roles (only Owner can do this)
- Create regular users and assign existing roles (defined by the Owner for their dealership)

### Regular Users
Created by administrators, assigned roles defined by the Owner. Permissions:
- Access only the modules and features granted by their assigned role
- Only see tabs/sections corresponding to their permissions (e.g., a user with only parking permissions cannot see Reservas or Peritajes tabs)

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
- **Never delete or modify git hooks.** Specifically, never delete or modify the `pre-push` hook in `.git/hooks/` or `.git/modules/*/hooks/`. If a git operation is blocked by a hook, ask the user for guidance instead of bypassing or removing the hook.
- **Never modify or delete the .env file.** The .env file contains critical environment variables and must not be altered.
- **Never make commits or pushes.** Only provide the user with the **list of files to commit**. The user will do the commit and push themselves.
- **If git pull fails**, show the user which files are causing the problem and ask what to do before taking any action. Do not reset or clean without user permission.
- **When sign in is successful**, the app shows parkings and vehicles. Use real data from backend via socket, not hardcoded data.