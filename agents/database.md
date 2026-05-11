# Database Specification

## Overview

MySQL 8 database with company-based multi-tenancy. Each company (concessionaire) has its own users, roles, permissions, parking lots, and vehicles.

## Schema

### Entity Relationship Diagram

```
companies
    │
    ├── users (1:N)
    │       └── roles (N:1)
    │               └── role_permissions (N:1)
    │                       └── permissions (N:1)
    │                               └── modules (N:1)
    │
    ├── company_modules (1:N)
    │       └── modules (N:1)
    │
    └── parking_lots (1:N)
            └── vehicles (N:1)
                    ├── car_brands (N:1)
                    │       └── car_models (N:1)
                    │               └── car_versions (N:1)
                    └── car_colors (N:1)
```

## Tables

### 1. companies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | NOT NULL | Company name |
| tax_id | VARCHAR(20) | NULL | Tax identification number |

```typescript
interface ICompany {
  id: number;
  name: string;
  tax_id?: string;
}
```

---

### 2. modules

System modules that can be subscribed by companies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Module identifier |
| description | VARCHAR(255) | NULL | Human-readable description |

**Seed data:**
- `parkings` - Depósitos y vehículos
- `reservations` - Reservas de vehículos
- `inspections` - Peritajes de vehículos usados

```typescript
interface IModule {
  id: number;
  name: 'parkings' | 'reservations' | 'inspections';
  description?: string;
}
```

---

### 3. permissions

Granular permissions within each module.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| module_id | INT | FK → modules.id | Parent module |
| name | VARCHAR(50) | NOT NULL | Permission identifier |
| description | VARCHAR(255) | NULL | Human-readable description |

**Seed data:**
| module | permission_name | description |
|--------|-----------------|-------------|
| parkings | parking_abm | ABM de parkings |
| parkings | vehicle_in_parking_abm | ABM de vehículos en parkings |
| parkings | parking_list | Listados de parkings |
| reservations | reservation_abm | ABM de reservas |
| reservations | reservation_list | Listados de reservas |
| inspections | vehicle_to_inspect_abm | ABM de vehículos a peritar |
| inspections | inspection_execute | Realizar peritaje |
| inspections | inspection_approve | Aprobar peritaje |

```typescript
interface IPermission {
  id: number;
  module_id: number;
  name: string;
  description?: string;
}
```

---

### 4. roles

Company-specific roles with assigned permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| company_id | INT | FK → companies.id | Parent company |
| name | VARCHAR(50) | NOT NULL | Role name |
| description | VARCHAR(255) | NULL | Role description |
| created_by | INT | NOT NULL | User ID who created this role |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Constraints:**
- Roles are scoped to the company that created them
- Each company can have multiple roles

```typescript
interface IRole {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: Date;
}
```

---

### 5. role_permissions

Many-to-many relationship between roles and permissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| role_id | INT | FK → roles.id | Role reference |
| permission_id | INT | FK → permissions.id | Permission reference |

**Constraints:**
- UNIQUE(role_id, permission_id) - No duplicate assignments

```typescript
interface IRolePermission {
  id: number;
  role_id: number;
  permission_id: number;
}
```

---

### 6. company_modules

Tracks which modules each company has subscribed to.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| company_id | INT | FK → companies.id | Company reference |
| module_id | INT | FK → modules.id | Module reference |
| active | BOOLEAN | DEFAULT TRUE | Subscription status |
| subscribed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Subscription date |
| expiry_date | DATE | NULL | Subscription expiry |

**Constraints:**
- UNIQUE(company_id, module_id) - No duplicate subscriptions

```typescript
interface ICompanyModule {
  id: number;
  company_id: number;
  module_id: number;
  active: boolean;
  subscribed_at: Date;
  expiry_date?: Date;
}
```

---

### 7. users

Application users with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| user_type | ENUM | DEFAULT 'regular' | User classification |
| company_id | INT | FK → companies.id | Parent company |
| role_id | INT | FK → roles.id, NULL | Assigned role |

**User Types:**
- `owner` - Company creator, full access, cannot be deleted
- `administrator` - Company admin, manages users and roles
- `regular` - Standard user with role-based permissions

```typescript
enum UserType {
  Owner = 'owner',
  Administrator = 'administrator',
  Regular = 'regular'
}

interface IUser {
  id: number;
  username: string;
  email: string;
  password: string; // hashed
  user_type: UserType;
  company_id?: number;
  role_id?: number;
}
```

---

### 8. parking_lots

Physical or logical parking areas for vehicles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(100) | NOT NULL | Lot name (e.g., "North Depot") |
| capacity | INT | DEFAULT 50 | Maximum vehicles |
| company_id | INT | FK → companies.id | Parent company |

```typescript
interface IParkingLot {
  id: number;
  name: string;
  capacity: number;
  company_id: number;
}
```

---

### 9. vehicles

Vehicles stored in parking lots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| plate | VARCHAR(20) | NOT NULL | License plate |
| brand_id | INT | FK → car_brands.id | Brand reference |
| model_id | INT | FK → car_models.id | Model reference |
| version_id | INT | FK → car_versions.id | Version reference |
| color_id | INT | FK → car_colors.id | Color reference |
| vin | VARCHAR(17) | NULL | Vehicle Identification Number |
| status | VARCHAR(20) | DEFAULT 'available' | Current status |
| company_id | INT | FK → companies.id | Parent company |
| parking_lot_id | INT | FK → parking_lots.id | Assigned lot |
| parking_lot_place | VARCHAR(20) | NULL | Specific spot (e.g., "A00001") |

**Vehicle Statuses:**
- `available` - Ready for sale or assignment
- `maintenance` - In repair or service
- `reserved` - Reserved by customer
- `sold` - Already sold

```typescript
enum VehicleStatus {
  Available = 'available',
  Maintenance = 'maintenance',
  Reserved = 'reserved',
  Sold = 'sold'
}

interface IVehicle {
  id: number;
  plate: string;
  brand_id?: number;
  model_id?: number;
  version_id?: number;
  color_id?: number;
  vin?: string;
  status: VehicleStatus;
  company_id: number;
  parking_lot_id?: number;
  parking_lot_place?: string;
}
```

---

### 10. car_brands

Vehicle brands from ACARA catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(50) | NOT NULL | Brand name (e.g., "Toyota") |

```typescript
interface ICarBrand {
  id: number;
  name: string;
}
```

---

### 11. car_models

Vehicle models per brand from ACARA catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| brand_id | INT | FK → car_brands.id | Parent brand |
| name | VARCHAR(50) | NOT NULL | Model name (e.g., "Hilux") |

```typescript
interface ICarModel {
  id: number;
  brand_id: number;
  name: string;
}
```

---

### 12. car_versions

Vehicle versions per model from ACARA catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| model_id | INT | FK → car_models.id | Parent model |
| name | VARCHAR(100) | NOT NULL | Version name (e.g., "SRX 4x4") |

```typescript
interface ICarVersion {
  id: number;
  model_id: number;
  name: string;
}
```

---

### 13. car_colors

Available vehicle colors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(30) | NOT NULL, UNIQUE | Color name |

**Seed colors:**
Blanco, Negro, Gris, Azul, Rojo, Plata, Verde

```typescript
interface ICarColor {
  id: number;
  name: string;
}
```

---

### 14. car_prices (not in seed.js, implied from ACARA)

Prices for vehicle versions by year, from ACARA PDF parser.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| version_id | INT | FK → car_versions.id | Version reference |
| year | INT | NOT NULL | Model year |
| price | DECIMAL(12,2) | NOT NULL | Price in local currency |

```typescript
interface ICarPrice {
  id: number;
  version_id: number;
  year: number;
  price: number;
}
```

---

## Relationships Summary

| Parent | Child | Type | Description |
|--------|-------|------|-------------|
| companies | users | 1:N | Each company has multiple users |
| companies | roles | 1:N | Each company creates multiple roles |
| companies | parking_lots | 1:N | Each company owns multiple lots |
| companies | vehicles | 1:N | Each company has multiple vehicles |
| roles | role_permissions | 1:N | Each role has multiple permissions |
| modules | permissions | 1:N | Each module has multiple permissions |
| modules | company_modules | 1:N | Modules can be subscribed by companies |
| car_brands | car_models | 1:N | Each brand has multiple models |
| car_models | car_versions | 1:N | Each model has multiple versions |
| car_versions | car_prices | 1:N | Each version has prices by year |
| parking_lots | vehicles | 1:N | Each lot contains multiple vehicles |
| car_colors | vehicles | 1:N | Color can be assigned to multiple vehicles |
| users | roles | N:1 | Users can have one role |
