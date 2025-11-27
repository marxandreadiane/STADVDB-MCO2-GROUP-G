-- ============================================
-- LOCAL POSTGRESQL INITIALIZATION SCHEMA
-- Schema-only script for local database
-- Data will be synced from Supabase via replication
-- ============================================

-- ============================================
-- PART 1: CREATE CORE TABLES
-- ============================================

-- 1. Companies (Entertainment Agencies)
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    headquarters VARCHAR(150),
    founded_year INTEGER,
    ceo_name VARCHAR(150)
);

-- 2. Artists
CREATE TABLE IF NOT EXISTS artists (
    artist_id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    debut_year INTEGER,
    fandom_name VARCHAR(100),
    CONSTRAINT fk_artist_company FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
);

-- 3. Albums
CREATE TABLE IF NOT EXISTS albums (
    album_id SERIAL PRIMARY KEY,
    artist_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    release_date DATE,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    image_url TEXT,
    CONSTRAINT fk_album_artist FOREIGN KEY (artist_id)
        REFERENCES artists(artist_id),
    CONSTRAINT unique_album_per_artist UNIQUE (title, artist_id)
);

-- 4. Users (with role column)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin', 'staff'))
);

-- 5. Orders (with DELIVERED status)
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED')),
    total_amount DECIMAL(10,2) DEFAULT 0,
    shipping_address TEXT,
    phone VARCHAR(20),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id),
    CONSTRAINT fk_orderitem_album FOREIGN KEY (album_id)
        REFERENCES albums(album_id)
);

-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(20) CHECK (method IN ('CREDIT_CARD','DEBIT_CARD','PAYPAL','GCASH','BANK_TRANSFER')),
    amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','REFUNDED')),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
);

-- 8. Cart Items (User Shopping Carts)
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_album FOREIGN KEY (album_id)
        REFERENCES albums(album_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_album UNIQUE (user_id, album_id)
);

-- ============================================
-- PART 2: CREATE INDEXES
-- ============================================

-- Indexes for cart performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_album_id ON cart_items(album_id);

-- ============================================
-- PART 3: CREATE TRIGGERS
-- ============================================

-- Function to update the updated_at timestamp for cart items
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row modification
DROP TRIGGER IF EXISTS cart_items_update_timestamp ON cart_items;
CREATE TRIGGER cart_items_update_timestamp
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_timestamp();

-- ============================================
-- PART 4: CREATE REPORTING VIEWS
-- ============================================

-- 1. Company Sales Report View (includes DELIVERED status)
CREATE OR REPLACE VIEW company_sales_report AS
SELECT 
    c.name as company_name,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT al.album_id) as albums_sold
FROM companies c
LEFT JOIN artists ar ON c.company_id = ar.company_id
LEFT JOIN albums al ON ar.artist_id = al.artist_id
LEFT JOIN order_items oi ON al.album_id = oi.album_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
GROUP BY c.company_id, c.name;

-- 2. Album Sales Report View (includes DELIVERED status)
CREATE OR REPLACE VIEW album_sales_report AS
SELECT 
    al.title as album_name,
    ar.name as artist_name,
    c.name as company_name,
    COALESCE(SUM(oi.quantity), 0) as sales_count,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
    al.price as unit_price
FROM albums al
LEFT JOIN artists ar ON al.artist_id = ar.artist_id
LEFT JOIN companies c ON ar.company_id = c.company_id
LEFT JOIN order_items oi ON al.album_id = oi.album_id
LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
GROUP BY al.album_id, al.title, ar.name, c.name, al.price;

-- 3. Monthly Sales Report View (includes DELIVERED status)
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT 
    DATE_TRUNC('month', o.order_date) as month,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value
FROM orders o
WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;

-- 4. Top Customers Report View (includes DELIVERED status)
CREATE OR REPLACE VIEW top_customers_report AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(DISTINCT o.order_id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
GROUP BY u.user_id, u.username, u.email
ORDER BY total_spent DESC;

-- 5. Payment Method Analytics
CREATE OR REPLACE VIEW payment_method_report AS
SELECT 
    p.method,
    COUNT(*) as transaction_count,
    SUM(p.amount) as total_amount,
    AVG(p.amount) as avg_transaction_amount
FROM payments p
WHERE p.status = 'COMPLETED'
GROUP BY p.method
ORDER BY total_amount DESC;

-- 6. Cart Items Detailed View (For easy cart querying)
CREATE OR REPLACE VIEW cart_items_detailed AS
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
    (ci.quantity * al.price) as subtotal
FROM cart_items ci
JOIN albums al ON ci.album_id = al.album_id
JOIN artists ar ON al.artist_id = ar.artist_id
JOIN companies c ON ar.company_id = c.company_id;

-- ============================================
-- PART 5: HELPER FUNCTIONS
-- ============================================

-- Function to get total cart value for a user
CREATE OR REPLACE FUNCTION get_cart_total(p_user_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * price), 0)
    INTO total
    FROM cart_items_detailed
    WHERE user_id = p_user_id;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get cart item count for a user
CREATE OR REPLACE FUNCTION get_cart_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    item_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(quantity), 0)
    INTO item_count
    FROM cart_items
    WHERE user_id = p_user_id;
    
    RETURN item_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clear cart for a user (useful after order completion)
CREATE OR REPLACE FUNCTION clear_user_cart(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    DELETE FROM cart_items WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove abandoned carts (items not updated in 30 days)
CREATE OR REPLACE FUNCTION cleanup_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cart_items
    WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIALIZATION COMPLETE
-- Data will be synced from Supabase
-- ============================================
