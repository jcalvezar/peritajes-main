---
sidebar_position: 2
---

# Reservations Module

Manages vehicle reservations. Customers indicate which vehicles they want that are not yet available at the dealership.

## Features

- **ABM of Reservations** — Add, edit, and delete reservations
- **Reservation Listings** — View all reservations

## Flow

```
POST /api/reservations ──► Create reservation ──► Backend emits event via socket ──► All clients update Redux state
```
