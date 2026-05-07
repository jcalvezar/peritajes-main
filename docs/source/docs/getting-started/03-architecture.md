---
sidebar_position: 3
---

# Architecture

Lion Cars uses a microservices-like architecture with separate containers for the database, backend, and frontend.

## System Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │      │  Backend    │      │    MySQL    │
│  (Next.js)  │─────►│  (Node.js)  │─────►│  Database  │
│             │◄─────│             │◄─────│             │
└─────────────┘      └─────────────┘      └─────────────┘
                           ▲
                           │
                    ┌─────────────┐
                    │   Mobile    │
                    │(React Native)
                    └─────────────┘
```

## Containers

All containers share the same Docker network (`lioncars_net`).

### 1. MySQL Database (`mysql_db`)

- **Image**: `mysql:8`
- **Port**: 3306
- **Purpose**: Persistent relational database

### 2. phpMyAdmin (`phpmyadmin`)

- **Image**: `phpmyadmin`
- **Port**: 8081
- **Purpose**: Web interface for database administration
- **Depends on**: mysql (healthy)

### 3. Backend (`node_backend`)

- **Location**: `./backend/` (git submodule)
- **Framework**: Node.js with Express
- **Features**: REST API + WebSocket support
- **Port**: 4000
- **Depends on**: mysql (healthy)

### 4. Frontend (`next_frontend`)

- **Location**: `./frontend/` (git submodule)
- **Framework**: Next.js
- **Port**: 3000
- **Depends on**: backend

## Communication Flow

1. **Frontend/Mobile** communicates with **Backend** via REST API and WebSocket
2. **Backend** processes requests, persists data in MySQL, and emits WebSocket events
3. Clients in the same `company_id` room receive real-time updates via WebSocket

## WebSocket Rooms

Clients are grouped by `company_{company_id}` for data isolation between dealerships. When a client connects, it emits `join_company` with its JWT token, and the backend extracts the `company_id` to join the appropriate room.
