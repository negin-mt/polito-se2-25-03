# Data Model Documentation
## Story Q1: Get Ticket

## Overview

This document describes the database schema and data model for the Office Queue Management System, specifically for  Q1 (Ticket Generation).

---

## Entity Relationship Diagram

```
┌─────────────────────┐         ┌─────────────────────┐
│   service_types     │         │      counters       │
├─────────────────────┤         ├─────────────────────┤
│ id (PK)             │◄───────┤│ id (PK)             │
│ name                │    1:N  │ counter_number      │
│ code                │         │ name                │
│ description         │         │ service_type_id (FK)│
│ average_service_time│         │ is_active           │
│ is_active           │         │ created_at          │
│ created_at          │         │ updated_at          │
│ updated_at          │         └─────────────────────┘
└─────────────────────┘                   │
         │                                │
         │ 1:N                            │ 1:N
         │                                │
         ▼                                ▼
┌─────────────────────────────────────────────────┐
│                    tickets                      │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ ticket_number (UNIQUE)                          │
│ service_type_id (FK) → service_types.id        │
│ status                                          │
│ counter_id (FK) → counters.id                  │
│ queue_position                                  │
│ issued_at                                       │
│ called_at                                       │
│ completed_at                                    │
│ cancelled_at                                    │
│ notes                                           │
└─────────────────────────────────────────────────┘
```

---

## Tables

### 1. service_types

Defines the different types of services offered by the office.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Service name (e.g., "Banking Services") |
| code | VARCHAR(10) | NOT NULL, UNIQUE | Service code for ticket prefix (e.g., "A") |
| description | TEXT | - | Detailed description of the service |
| average_service_time | INTEGER | DEFAULT 10 | Average time in minutes per customer |
| is_active | BOOLEAN | DEFAULT 1 | Whether service is currently available |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- None (small table, primary key is sufficient)

**Business Rules:**
- Service codes should be short (1-3 characters) for readability
- Inactive services should not accept new tickets
- Service codes are used in ticket number generation

**Sample Data:**
```sql
('Banking Services', 'A', 'General banking operations', 10, 1)
('Customer Support', 'B', 'Customer inquiries', 15, 1)
```

---

### 2. counters

Represents physical service counters/desks in the office.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| counter_number | INTEGER | NOT NULL, UNIQUE | Display number (1, 2, 3...) |
| name | VARCHAR(50) | NOT NULL | Counter name (e.g., "Counter 1") |
| service_type_id | INTEGER | FK → service_types.id | Service type this counter handles |
| is_active | BOOLEAN | DEFAULT 1 | Whether counter is currently operating |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- `idx_counters_active` on `is_active`

**Business Rules:**
- A counter can only serve one service type at a time
- Counter numbers are displayed to customers
- Inactive counters cannot call new tickets

**Sample Data:**
```sql
(1, 'Counter 1', 1, 1)  -- Banking
(2, 'Counter 2', 1, 1)  -- Banking
```

---

### 3. tickets

Core table storing all issued tickets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| ticket_number | VARCHAR(20) | NOT NULL, UNIQUE | Display ticket number (e.g., "A001") |
| service_type_id | INTEGER | NOT NULL, FK → service_types.id | Service type selected |
| status | VARCHAR(20) | NOT NULL, CHECK IN (...) | Current ticket status |
| counter_id | INTEGER | FK → counters.id, NULLABLE | Assigned counter (null if waiting) |
| queue_position | INTEGER | NOT NULL | Position in queue for this service |
| issued_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When ticket was issued |
| called_at | TIMESTAMP | NULLABLE | When ticket was called to counter |
| completed_at | TIMESTAMP | NULLABLE | When service was completed |
| cancelled_at | TIMESTAMP | NULLABLE | When ticket was cancelled |
| notes | TEXT | NULLABLE | Additional information |

**Status Values:**
- `WAITING` - Customer waiting in queue
- `SERVING` - Customer being served at counter
- `COMPLETED` - Service completed successfully
- `CANCELLED` - Ticket cancelled (no-show, customer left)

**Indexes:**
- `idx_tickets_ticket_number` on `ticket_number` (lookup by number)
- `idx_tickets_service_type` on `service_type_id` (filter by service)
- `idx_tickets_status` on `status` (filter by status)
- `idx_tickets_service_status` on `(service_type_id, status)` (composite for queue queries)
- `idx_tickets_counter` on `counter_id` (counter assignments)
- `idx_tickets_issued_at` on `issued_at` (time-based queries)

**Business Rules:**
- Ticket numbers must be unique across all services
- Format: `[Service Code][Sequence Number]` (e.g., A001, B042)
- Sequence numbers reset daily (handled in application logic)
- Queue position is assigned at ticket creation
- Only one timestamp should be set per status (called_at for SERVING, completed_at for COMPLETED)

---


## Triggers

### 1. update_service_types_timestamp

Automatically updates `updated_at` when a service type is modified.

```sql
CREATE TRIGGER update_service_types_timestamp 
AFTER UPDATE ON service_types
BEGIN
    UPDATE service_types 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
```

### 2. update_counters_timestamp

Automatically updates `updated_at` when a counter is modified.

```sql
CREATE TRIGGER update_counters_timestamp 
AFTER UPDATE ON counters
BEGIN
    UPDATE counters 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;
```

---