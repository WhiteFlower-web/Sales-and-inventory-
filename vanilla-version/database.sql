-- Database: pos_db
CREATE DATABASE IF NOT EXISTS pos_db;
USE pos_db;

-- Table for Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
    qr_auth_token VARCHAR(255) UNIQUE,
    otp_code VARCHAR(10),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Inventory (Inventory Control)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    buying_price DECIMAL(10, 2),
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'pcs'
);

-- Table for Stock History (Auditing Inventory Changes)
CREATE TABLE IF NOT EXISTS stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    change_qty INT,
    type ENUM('restock', 'sale', 'adjustment', 'return'),
    reason TEXT,
    staff_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table for Sales Transactions (Sales Terminal)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    or_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    cash_received DECIMAL(10, 2),
    cash_change DECIMAL(10, 2),
    staff_id INT,
    terminal_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_voided BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (staff_id) REFERENCES users(id)
);

-- Table for Transaction Detailed Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    product_id INT,
    quantity INT,
    price_at_sale DECIMAL(10, 2),
    total DECIMAL(10, 2),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Table for Audit Logs (System actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50), -- e.g., 'LOGIN', 'VOID_SALE', 'DELETE_PRODUCT'
    description TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin (Password: admin123)
-- In real app, use password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@judejush.com', '$2y$10$wNUpF6XN9vYp8A6zG6zY6e6Y6e6Y6e6Y6e6Y6e6Y6e6Y6e6Y6e6', 'admin');

-- Sample Inventory Data
INSERT INTO products (sku, barcode, name, category, price, stock, min_stock_level) VALUES 
('SKU-1001', '4800000001', 'Wireless Mouse Pro', 'Hardware', 49.99, 15, 5),
('SKU-1002', '4800000002', 'Mechanical Keyboard RGB', 'Hardware', 129.99, 8, 10),
('SKU-1003', '4800000003', '7-Port USB-C Hub', 'Accessories', 35.50, 25, 5);
