---
sidebar_position: 2
---

# Installation

## Prerequisites

- Node.js >= 20
- Docker and Docker Compose
- Git

## Clone and Initialize

```bash
git clone <repository-url>
cd lion-cars
git submodule update --init --recursive
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
DB_HOST=mysql_db
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lion_cars
BACKEND_PORT=4000
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:4000
JWT_SECRET=your_secret_key
```

## Start Services

```bash
docker compose up -d
```

This starts the following containers:

| Container | Port | Description |
|---|---|---|
| `mysql_db` | 3306 | MySQL database |
| `phpmyadmin` | 8081 | Database admin interface |
| `node_backend` | 4000 | Backend API |
| `next_frontend` | 3000 | Frontend web app |

## Verify

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- phpMyAdmin: `http://localhost:8081`
