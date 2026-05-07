---
sidebar_position: 1
---

# Overview

Lion Cars is a vehicle dealership management system built with a microservices-like architecture. It provides tools for managing vehicle parkings, reservations, and inspections.

## System Modules

The system is divided into 3 independent, subscription-based modules:

1. **Parkings** — Vehicle depositories management. Includes ABM of parking lots, ABM of vehicles within lots, and parking listings.
2. **Reservations** — Vehicle reservations for customers who want vehicles not yet available at the dealership. Includes ABM of reservations and reservation listings.
3. **Inspections** — Used vehicle inspections covering engine, paint, tires, interior, and other checks. Includes ABM of vehicles to inspect, inspection execution, and approval workflow.

## Tech Stack

- **Database**: MySQL 8
- **Backend**: Node.js + Express (REST API + WebSocket)
- **Frontend**: Next.js (React)
- **Mobile**: React Native (Expo)
- **State Management**: Redux Toolkit
- **Infrastructure**: Docker Compose

## Documentation Structure

- [Installation](./installation) — Setup and run the project
- [Architecture](./architecture) — System design and containers
- [State Management](../state-management/architecture) — Redux slices and hooks
- [Data Flow](../data-flow/http-websocket) — HTTP and WebSocket communication
- [Modules](../modules/parkings) — Parkings, Reservations, Inspections
- [API Reference](../api/auth) — REST API endpoints
- [ACARA Parser](../parser/acara-parser) — Vehicle price parser
