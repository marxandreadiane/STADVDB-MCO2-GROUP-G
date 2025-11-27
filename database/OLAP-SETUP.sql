-- ============================================
-- OLAP DATABASE SETUP FOR KPOP STORE
-- Analytics and Reporting Tables
-- Run this in your LOCAL PostgreSQL via pgAdmin
-- This creates a separate OLAP database that pulls data from Supabase
-- ============================================

-- ============================================
-- PART 0: SETUP FOREIGN DATA WRAPPER
-- ============================================

-- Install postgres_fdw extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Create foreign server connection to Supabase
-- Credentials from your .env file
CREATE SERVER IF NOT EXISTS supabase_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (
        host 'aws-1-ap-southeast-2.pooler.supabase.com',
        port '6543',
        dbname 'postgres',
        sslmode 'require'
    );

-- Create user mapping for the foreign server
-- Using your actual Supabase credentials
CREATE USER MAPPING IF NOT EXISTS FOR postgres
    SERVER supabase_server
    OPTIONS (
        user 'postgres.ucrvnxomoogsbcpbnldi',
        password 'kpop-db-pass'
    );

-- Import foreign schemas (tables from Supabase)
-- This creates local references to remote tables
DROP SCHEMA IF EXISTS supabase_data CASCADE;
CREATE SCHEMA supabase_data;

IMPORT FOREIGN SCHEMA public
    LIMIT TO (companies, artists, albums, users, orders, order_items, payments, cart_items)
    FROM SERVER supabase_server
    INTO supabase_data;

-- ============================================
-- PART 1: DROP OLD VIEWS & CREATE OLAP REPORTING TABLES
-- ============================================

-- Drop old views if they exist (from OLTP setup)
DROP VIEW IF EXISTS company_sales_report CASCADE;
DROP VIEW IF EXISTS album_sales_report CASCADE;
DROP VIEW IF EXISTS monthly_sales_report CASCADE;
DROP VIEW IF EXISTS top_customers_report CASCADE;
DROP VIEW IF EXISTS payment_method_report CASCADE;
DROP VIEW IF EXISTS cart_items_detailed CASCADE;

-- 1. Company Sales Report Table
CREATE TABLE IF NOT EXISTS company_sales_report (
    report_id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    albums_sold INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_name)
);

-- 2. Album Sales Report Table
CREATE TABLE IF NOT EXISTS album_sales_report (
    report_id SERIAL PRIMARY KEY,
    album_name VARCHAR(200) NOT NULL,
    artist_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    sales_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(album_name, artist_name)
);

-- 3. Monthly Sales Report Table
CREATE TABLE IF NOT EXISTS monthly_sales_report (
    report_id SERIAL PRIMARY KEY,
    month TIMESTAMP NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month)
);

-- 4. Top Customers Report Table
CREATE TABLE IF NOT EXISTS top_customers_report (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 5. Payment Method Analytics Table
CREATE TABLE IF NOT EXISTS payment_method_report (
    report_id SERIAL PRIMARY KEY,
    method VARCHAR(20) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    avg_transaction_amount DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(method)
);

-- 6. Cart Items Detailed Table (Snapshot)
CREATE TABLE IF NOT EXISTS cart_items_detailed (
    snapshot_id SERIAL PRIMARY KEY,
    cart_item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    added_at TIMESTAMP,
    updated_at TIMESTAMP,
    album_name VARCHAR(200) NOT NULL,
    artist_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for company_sales_report
CREATE INDEX IF NOT EXISTS idx_company_sales_name ON company_sales_report(company_name);
CREATE INDEX IF NOT EXISTS idx_company_sales_updated ON company_sales_report(last_updated);

-- Indexes for album_sales_report
CREATE INDEX IF NOT EXISTS idx_album_sales_album ON album_sales_report(album_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_artist ON album_sales_report(artist_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_company ON album_sales_report(company_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_updated ON album_sales_report(last_updated);

-- Indexes for monthly_sales_report
CREATE INDEX IF NOT EXISTS idx_monthly_sales_month ON monthly_sales_report(month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_sales_updated ON monthly_sales_report(last_updated);

-- Indexes for top_customers_report
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON top_customers_report(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_spent ON top_customers_report(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_updated ON top_customers_report(last_updated);

-- Indexes for payment_method_report
CREATE INDEX IF NOT EXISTS idx_payment_method ON payment_method_report(method);
CREATE INDEX IF NOT EXISTS idx_payment_updated ON payment_method_report(last_updated);

-- Indexes for cart_items_detailed
CREATE INDEX IF NOT EXISTS idx_cart_detailed_user ON cart_items_detailed(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_detailed_album ON cart_items_detailed(album_id);
CREATE INDEX IF NOT EXISTS idx_cart_detailed_snapshot ON cart_items_detailed(snapshot_date DESC);

-- ============================================
-- PART 3: DATA REFRESH FUNCTIONS
-- ============================================

-- Function to refresh Company Sales Report
CREATE OR REPLACE FUNCTION refresh_company_sales_report()
RETURNS VOID AS $$
BEGIN
    -- Pull data from Supabase via Foreign Data Wrapper
    
    DELETE FROM company_sales_report;
    
    INSERT INTO company_sales_report (company_name, total_sales, total_orders, albums_sold, last_updated)
    SELECT 
        c.name as company_name,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT al.album_id) as albums_sold,
        CURRENT_TIMESTAMP
    FROM supabase_data.companies c
    LEFT JOIN supabase_data.artists ar ON c.company_id = ar.company_id
    LEFT JOIN supabase_data.albums al ON ar.artist_id = al.artist_id
    LEFT JOIN supabase_data.order_items oi ON al.album_id = oi.album_id
    LEFT JOIN supabase_data.orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    GROUP BY c.company_id, c.name
    ON CONFLICT (company_name) 
    DO UPDATE SET
        total_sales = EXCLUDED.total_sales,
        total_orders = EXCLUDED.total_orders,
        albums_sold = EXCLUDED.albums_sold,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Album Sales Report
CREATE OR REPLACE FUNCTION refresh_album_sales_report()
RETURNS VOID AS $$
BEGIN
    DELETE FROM album_sales_report;
    
    INSERT INTO album_sales_report (album_name, artist_name, company_name, sales_count, total_revenue, unit_price, last_updated)
    SELECT 
        al.title as album_name,
        ar.name as artist_name,
        c.name as company_name,
        COALESCE(SUM(oi.quantity), 0) as sales_count,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
        al.price as unit_price,
        CURRENT_TIMESTAMP
    FROM supabase_data.albums al
    LEFT JOIN supabase_data.artists ar ON al.artist_id = ar.artist_id
    LEFT JOIN supabase_data.companies c ON ar.company_id = c.company_id
    LEFT JOIN supabase_data.order_items oi ON al.album_id = oi.album_id
    LEFT JOIN supabase_data.orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    GROUP BY al.album_id, al.title, ar.name, c.name, al.price
    ON CONFLICT (album_name, artist_name)
    DO UPDATE SET
        company_name = EXCLUDED.company_name,
        sales_count = EXCLUDED.sales_count,
        total_revenue = EXCLUDED.total_revenue,
        unit_price = EXCLUDED.unit_price,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Monthly Sales Report
CREATE OR REPLACE FUNCTION refresh_monthly_sales_report()
RETURNS VOID AS $$
BEGIN
    DELETE FROM monthly_sales_report;
    
    INSERT INTO monthly_sales_report (month, total_orders, total_revenue, avg_order_value, last_updated)
    SELECT 
        DATE_TRUNC('month', o.order_date) as month,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        CURRENT_TIMESTAMP
    FROM supabase_data.orders o
    WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    GROUP BY DATE_TRUNC('month', o.order_date)
    ON CONFLICT (month)
    DO UPDATE SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        avg_order_value = EXCLUDED.avg_order_value,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Top Customers Report
CREATE OR REPLACE FUNCTION refresh_top_customers_report()
RETURNS VOID AS $$
BEGIN
    DELETE FROM top_customers_report;
    
    INSERT INTO top_customers_report (user_id, username, email, total_orders, total_spent, avg_order_value, last_updated)
    SELECT 
        u.user_id,
        u.username,
        u.email,
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        CURRENT_TIMESTAMP
    FROM supabase_data.users u
    LEFT JOIN supabase_data.orders o ON u.user_id = o.user_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    GROUP BY u.user_id, u.username, u.email
    ON CONFLICT (user_id)
    DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        total_orders = EXCLUDED.total_orders,
        total_spent = EXCLUDED.total_spent,
        avg_order_value = EXCLUDED.avg_order_value,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Payment Method Report
CREATE OR REPLACE FUNCTION refresh_payment_method_report()
RETURNS VOID AS $$
BEGIN
    DELETE FROM payment_method_report;
    
    INSERT INTO payment_method_report (method, transaction_count, total_amount, avg_transaction_amount, last_updated)
    SELECT 
        p.method,
        COUNT(*) as transaction_count,
        SUM(p.amount) as total_amount,
        AVG(p.amount) as avg_transaction_amount,
        CURRENT_TIMESTAMP
    FROM supabase_data.payments p
    WHERE p.status = 'COMPLETED'
    GROUP BY p.method
    ON CONFLICT (method)
    DO UPDATE SET
        transaction_count = EXCLUDED.transaction_count,
        total_amount = EXCLUDED.total_amount,
        avg_transaction_amount = EXCLUDED.avg_transaction_amount,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Cart Items Detailed (creates snapshots)
CREATE OR REPLACE FUNCTION refresh_cart_items_detailed()
RETURNS VOID AS $$
BEGIN
    INSERT INTO cart_items_detailed (
        cart_item_id, user_id, album_id, quantity, added_at, updated_at,
        album_name, artist_name, company_name, price, image_url, subtotal, snapshot_date
    )
    SELECT 
        ci.cart_item_id,
        ci.user_id,
        ci.album_id,
        ci.quantity,
        ci.added_at,
        ci.updated_at,
        al.title as album_name,
        ar.name as artist_name,
        c.name as company_name,
        al.price,
        al.image_url,
        (ci.quantity * al.price) as subtotal,
        CURRENT_TIMESTAMP
    FROM supabase_data.cart_items ci
    JOIN supabase_data.albums al ON ci.album_id = al.album_id
    JOIN supabase_data.artists ar ON al.artist_id = ar.artist_id
    JOIN supabase_data.companies c ON ar.company_id = c.company_id;
END;
$$ LANGUAGE plpgsql;

-- Master function to refresh all reports
CREATE OR REPLACE FUNCTION refresh_all_reports()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_company_sales_report();
    PERFORM refresh_album_sales_report();
    PERFORM refresh_monthly_sales_report();
    PERFORM refresh_top_customers_report();
    PERFORM refresh_payment_method_report();
    PERFORM refresh_cart_items_detailed();
    
    RAISE NOTICE 'All OLAP reports refreshed successfully at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: VERIFICATION
-- ============================================

-- Check if all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM (
    VALUES 
        ('company_sales_report'), 
        ('album_sales_report'), 
        ('monthly_sales_report'),
        ('top_customers_report'),
        ('payment_method_report'),
        ('cart_items_detailed')
) AS t(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = t.table_name
)
ORDER BY table_name;

-- Success message
SELECT '✅ OLAP DATABASE SETUP SUCCESSFUL!' as status,
       '📊 6 reporting tables created' as tables,
       '🔍 Performance indexes added' as indexes,
       '⚡ 7 refresh functions available' as functions,
       '🔄 Use refresh_all_reports() to sync data' as usage,
       '🌐 Connected to Supabase via Foreign Data Wrapper' as connection,
       '📍 Access via pgAdmin at http://localhost:5050' as access;
