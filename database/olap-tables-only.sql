-- ============================================
-- OLAP DENORMALIZED TABLES CREATION
-- This file contains only the OLAP table and function creation
-- Used by reset-olap.js to recreate OLAP structure
-- ============================================

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

-- 7. Sales Fact Table (Denormalized Transaction-Level Data)
CREATE TABLE IF NOT EXISTS sales_fact (
    fact_id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    order_date TIMESTAMP NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    user_id INTEGER NOT NULL,
    username VARCHAR(100),
    email VARCHAR(150),
    album_id INTEGER NOT NULL,
    album_title VARCHAR(200) NOT NULL,
    artist_id INTEGER NOT NULL,
    artist_name VARCHAR(150) NOT NULL,
    company_id INTEGER NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_item_id)
);

-- Create indexes for OLAP tables
CREATE INDEX IF NOT EXISTS idx_company_sales_name ON company_sales_report(company_name);
CREATE INDEX IF NOT EXISTS idx_company_sales_updated ON company_sales_report(last_updated);
CREATE INDEX IF NOT EXISTS idx_album_sales_album ON album_sales_report(album_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_artist ON album_sales_report(artist_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_company ON album_sales_report(company_name);
CREATE INDEX IF NOT EXISTS idx_album_sales_updated ON album_sales_report(last_updated);
CREATE INDEX IF NOT EXISTS idx_monthly_sales_month ON monthly_sales_report(month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_sales_updated ON monthly_sales_report(last_updated);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON top_customers_report(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_spent ON top_customers_report(total_spent DESC);
CREATE INDEX IF NOT EXISTS idx_customers_updated ON top_customers_report(last_updated);
CREATE INDEX IF NOT EXISTS idx_payment_method ON payment_method_report(method);
CREATE INDEX IF NOT EXISTS idx_payment_updated ON payment_method_report(last_updated);
CREATE INDEX IF NOT EXISTS idx_cart_detailed_user ON cart_items_detailed(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_detailed_album ON cart_items_detailed(album_id);
CREATE INDEX IF NOT EXISTS idx_cart_detailed_snapshot ON cart_items_detailed(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_fact_order_id ON sales_fact(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_fact_order_date ON sales_fact(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_fact_order_status ON sales_fact(order_status);
CREATE INDEX IF NOT EXISTS idx_sales_fact_user_id ON sales_fact(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_fact_album_id ON sales_fact(album_id);
CREATE INDEX IF NOT EXISTS idx_sales_fact_artist_id ON sales_fact(artist_id);
CREATE INDEX IF NOT EXISTS idx_sales_fact_company_id ON sales_fact(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_fact_company_name ON sales_fact(company_name);
CREATE INDEX IF NOT EXISTS idx_sales_fact_artist_name ON sales_fact(artist_name);
CREATE INDEX IF NOT EXISTS idx_sales_fact_updated ON sales_fact(last_updated);

-- ============================================
-- OLAP REFRESH FUNCTIONS
-- ============================================

-- Function to refresh Company Sales Report
CREATE OR REPLACE FUNCTION refresh_company_sales_report()
RETURNS VOID AS $$
BEGIN
    DELETE FROM company_sales_report;
    
    INSERT INTO company_sales_report (company_name, total_sales, total_orders, albums_sold, last_updated)
    SELECT 
        c.name as company_name,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales,
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT al.album_id) as albums_sold,
        CURRENT_TIMESTAMP
    FROM companies c
    LEFT JOIN artists ar ON c.company_id = ar.company_id
    LEFT JOIN albums al ON ar.artist_id = al.artist_id
    LEFT JOIN order_items oi ON al.album_id = oi.album_id
    LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
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
    FROM albums al
    LEFT JOIN artists ar ON al.artist_id = ar.artist_id
    LEFT JOIN companies c ON ar.company_id = c.company_id
    LEFT JOIN order_items oi ON al.album_id = oi.album_id
    LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
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
    FROM orders o
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
    FROM users u
    LEFT JOIN orders o ON u.user_id = o.user_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
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
    FROM payments p
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
    FROM cart_items ci
    JOIN albums al ON ci.album_id = al.album_id
    JOIN artists ar ON al.artist_id = ar.artist_id
    JOIN companies c ON ar.company_id = c.company_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh Sales Fact Table (Denormalized Transaction Data)
CREATE OR REPLACE FUNCTION refresh_sales_fact()
RETURNS VOID AS $$
BEGIN
    DELETE FROM sales_fact;
    
    INSERT INTO sales_fact (
        order_item_id, order_id, order_date, order_status,
        user_id, username, email,
        album_id, album_title,
        artist_id, artist_name,
        company_id, company_name,
        quantity, price, total_amount, last_updated
    )
    SELECT 
        oi.order_item_id,
        o.order_id,
        o.order_date,
        o.status as order_status,
        u.user_id,
        u.username,
        u.email,
        al.album_id,
        al.title as album_title,
        ar.artist_id,
        ar.name as artist_name,
        c.company_id,
        c.name as company_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) as total_amount,
        CURRENT_TIMESTAMP
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    JOIN users u ON o.user_id = u.user_id
    JOIN albums al ON oi.album_id = al.album_id
    JOIN artists ar ON al.artist_id = ar.artist_id
    JOIN companies c ON ar.company_id = c.company_id
    WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    ON CONFLICT (order_item_id) 
    DO UPDATE SET
        order_id = EXCLUDED.order_id,
        order_date = EXCLUDED.order_date,
        order_status = EXCLUDED.order_status,
        user_id = EXCLUDED.user_id,
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        album_id = EXCLUDED.album_id,
        album_title = EXCLUDED.album_title,
        artist_id = EXCLUDED.artist_id,
        artist_name = EXCLUDED.artist_name,
        company_id = EXCLUDED.company_id,
        company_name = EXCLUDED.company_name,
        quantity = EXCLUDED.quantity,
        price = EXCLUDED.price,
        total_amount = EXCLUDED.total_amount,
        last_updated = EXCLUDED.last_updated;
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
    PERFORM refresh_sales_fact();
    
    RAISE NOTICE 'All OLAP reports refreshed successfully at %', CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

