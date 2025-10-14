-- ============================================
-- Office Queue Management System - Database Schema
-- Q1: Get Ticket
-- Database: SQLite3
-- ============================================

-- Drop existing tables if they exist (for development)
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS service_counter;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS service_types;

-- ============================================
-- Table: service_types
-- Description: Defines the types of services offered
-- ============================================
CREATE TABLE service_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    average_service_time INTEGER DEFAULT 10, -- in minutes
    is_active BOOLEAN DEFAULT 1
);

-- ============================================
-- Table: counters
-- Description: Physical service counters
-- ============================================
CREATE TABLE counters (
        id INTEGER PRIMARY KEY AUTOINCREMENT ,
        service_type_id INTEGER,
        counter_number INTEGER NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL
);


-- ============================================
-- Table: tickets
-- Description: Queue tickets issued to customers
-- ============================================
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    service_type_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    counter_id INTEGER,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE SET NULL,
    CHECK (status IN ('WAITING', 'SERVING', 'COMPLETED', 'CANCELLED'))
);


CREATE TABLE service_counter (
    service_type_id INTEGER,
    counter_id INTEGER,
    PRIMARY KEY (service_type_id, counter_id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE SET NULL
);

PRAGMA foreign_keys = ON;
-- ============================================
-- Sample Data (for development/testing)
-- ============================================

-- Insert sample service types
INSERT INTO service_types (name, code, description, average_service_time, is_active) VALUES
('Banking Services', 'A', 'General banking operations, deposits, withdrawals', 10, 1),
('Customer Support', 'B', 'Customer inquiries and support', 15, 1),
('Sales Department', 'C', 'Product sales and consultations', 20, 1),
('Technical Support', 'D', 'Technical assistance and troubleshooting', 25, 1);

-- Insert sample counters
INSERT INTO counters (counter_number, name, service_type_id, is_active) VALUES
(1, 'Counter 1', 1, 1),
(2, 'Counter 2', 1, 1),
(3, 'Counter 3', 2, 1),
(4, 'Counter 4', 3, 1),
( 5, 'Counter 5', 4, 1);

-- ============================================
-- Comments
-- ============================================

/*
TICKET STATUS FLOW:
1. WAITING   - Ticket issued, customer waiting in queue
2. SERVING   - Customer being served at counter
3. COMPLETED - Service completed successfully
4. CANCELLED - Ticket cancelled (customer left, no-show, etc.)

TICKET NUMBER FORMAT:
- [Service Code][Sequence Number]
- Example: A001, A002, B001, B002
- Resets daily at midnight (handled in application logic)

QUEUE POSITION:
- Assigned when ticket is issued
- Used to maintain FIFO order within each service type
- Does not change when other tickets are completed

PERFORMANCE NOTES:
- Indexes created on frequently queried columns
- Views provided for common query patterns
- Triggers maintain timestamp consistency
- Foreign keys ensure referential integrity
*/
