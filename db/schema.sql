-- Invoice Recovery Case Tracker - Database Schema
-- Compatible with SQLite, PostgreSQL, and MySQL

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    city VARCHAR(100),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_amount DECIMAL(15, 2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'New' NOT NULL,
    last_follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_client_name ON clients(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_due_date ON cases(due_date);
CREATE INDEX IF NOT EXISTS idx_cases_invoice_number ON cases(invoice_number);
