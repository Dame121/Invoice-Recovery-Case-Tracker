-- Database initialization script for Invoice Recovery Tracker
-- Creates clients and cases tables with proper relationships

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    city VARCHAR(100),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cases table with foreign key to clients
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_amount DECIMAL(15, 2) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    last_follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_due_date ON cases(due_date);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON clients(company_name);

-- Insert sample data for testing (optional)
-- Uncomment the following lines if you want sample data

-- INSERT INTO clients (client_name, company_name, city, contact_person, phone, email) VALUES
-- ('John Doe', 'ABC Corporation', 'New York', 'Jane Smith', '+1-555-0100', 'john.doe@abc.com'),
-- ('Mike Johnson', 'XYZ Industries', 'Los Angeles', 'Sarah Wilson', '+1-555-0200', 'mike.j@xyz.com');

-- INSERT INTO cases (client_id, invoice_number, invoice_amount, invoice_date, due_date, status, last_follow_up_notes) VALUES
-- (1, 'INV-2026-001', 5000.00, '2025-12-01', '2026-01-01', 'overdue', 'Called on Jan 5, promised to pay by Jan 15'),
-- (1, 'INV-2026-002', 2500.00, '2025-12-15', '2026-01-15', 'pending', NULL),
-- (2, 'INV-2026-003', 10000.00, '2025-11-01', '2025-12-01', 'recovered', 'Payment received on Dec 20');
