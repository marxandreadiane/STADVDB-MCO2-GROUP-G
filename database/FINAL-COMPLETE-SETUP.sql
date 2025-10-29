-- ============================================
-- COMPLETE DATABASE SETUP FOR KPOP STORE
-- WITH CART FUNCTIONALITY + ADMIN ROLES
-- Run this entire file in your Supabase SQL Editor
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
-- PART 3: ADD MISSING COLUMNS (MIGRATIONS)
-- ============================================

-- Add columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Add columns to albums table if they don't exist
ALTER TABLE albums ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add unique constraint to albums to prevent duplicates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_album_per_artist' 
        AND table_name = 'albums'
    ) THEN
        ALTER TABLE albums ADD CONSTRAINT unique_album_per_artist UNIQUE (title, artist_id);
    END IF;
END $$;

-- Add columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add columns to payments table if they don't exist
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING';

-- Drop the unique constraint on username if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_key' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_username_key;
    END IF;
END $$;

-- Add role constraint to users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE constraint_name = 'users_role_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('customer', 'admin', 'staff'));
    END IF;
END $$;

-- Update orders status constraint to include DELIVERED
DO $$ 
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_status_check' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    END IF;
    
    -- Add new constraint with DELIVERED
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED'));
END $$;

-- ============================================
-- PART 4: CREATE TRIGGERS
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
-- PART 5: INSERT SAMPLE DATA
-- ============================================

-- Sample data for companies
INSERT INTO companies (name, headquarters, founded_year, ceo_name)
SELECT 'SM Entertainment', 'Seoul, South Korea', 1995, 'Lee Sung-soo'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'SM Entertainment');

INSERT INTO companies (name, headquarters, founded_year, ceo_name)
SELECT 'JYP Entertainment', 'Seoul, South Korea', 1997, 'Park Jin-young'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'JYP Entertainment');

INSERT INTO companies (name, headquarters, founded_year, ceo_name)
SELECT 'YG Entertainment', 'Seoul, South Korea', 1996, 'Hwang Bo-kyung'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'YG Entertainment');

-- Sample data for artists
INSERT INTO artists (company_id, name, debut_year, fandom_name)
SELECT 1, 'EXO', 2012, 'EXO-L'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'EXO');

INSERT INTO artists (company_id, name, debut_year, fandom_name)
SELECT 1, 'Red Velvet', 2014, 'ReVeluv'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Red Velvet');

INSERT INTO artists (company_id, name, debut_year, fandom_name)
SELECT 2, 'TWICE', 2015, 'ONCE'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'TWICE');

INSERT INTO artists (company_id, name, debut_year, fandom_name)
SELECT 2, 'Stray Kids', 2018, 'STAY'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'Stray Kids');

INSERT INTO artists (company_id, name, debut_year, fandom_name)
SELECT 3, 'BLACKPINK', 2016, 'BLINK'
WHERE NOT EXISTS (SELECT 1 FROM artists WHERE name = 'BLACKPINK');

-- Sample data for albums (using UPSERT to prevent duplicates)
INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (1, 'EXIST', '2023-07-10', 15.99, 100, '/images/albums/1.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (1, 'Don''t Fight the Feeling', '2021-06-07', 14.99, 50, '/images/albums/2.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (2, 'The ReVe Festival 2022', '2022-08-16', 16.99, 75, '/images/albums/3.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (2, 'Feel My Rhythm', '2022-03-21', 15.99, 60, '/images/albums/4.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (3, 'Formula of Love', '2021-11-12', 17.99, 80, '/images/albums/5.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (3, 'Taste of Love', '2021-06-11', 16.99, 90, '/images/albums/6.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (4, '5-STAR', '2023-06-02', 18.99, 120, '/images/albums/7.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (4, 'MAXIDENT', '2022-10-07', 17.99, 100, '/images/albums/8.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (5, 'BORN PINK', '2022-09-16', 19.99, 150, '/images/albums/9.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

INSERT INTO albums (artist_id, title, release_date, price, stock_quantity, image_url)
VALUES (5, 'The Album', '2020-10-02', 18.99, 130, '/images/albums/10.jpg')
ON CONFLICT (title, artist_id) DO UPDATE 
SET image_url = COALESCE(EXCLUDED.image_url, albums.image_url),
    price = EXCLUDED.price,
    stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity,
    release_date = COALESCE(EXCLUDED.release_date, albums.release_date);

-- Sample data for regular users
INSERT INTO users (username, email, password, phone, address, role)
SELECT 'kpop_fan123', 'fan123@email.com', 'password123', '+82-10-1234-5678', '123 Main St, Seoul', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fan123@email.com');

INSERT INTO users (username, email, password, phone, address, role)
SELECT 'music_lover', 'music@email.com', 'password123', '+82-10-2345-6789', '456 Oak Ave, Busan', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'music@email.com');

INSERT INTO users (username, email, password, phone, address, role)
SELECT 'collector99', 'collector@email.com', 'password123', '+82-10-3456-7890', '789 Pine Rd, Incheon', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'collector@email.com');

-- Sample data for admin users
INSERT INTO users (username, email, password, phone, address, role)
SELECT 'admin', 'admin@kpopstore.com', 'admin123', '+63-123-456-7890', 'Admin Office, Manila', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@kpopstore.com');

INSERT INTO users (username, email, password, phone, address, role)
SELECT 'superadmin', 'superadmin@kpopstore.com', 'super123', '+63-987-654-3210', 'HQ Office, Manila', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@kpopstore.com');

-- Update any existing admin accounts to have admin role
UPDATE users SET role = 'admin' 
WHERE (email = 'admin@kpopstore.com' OR username = 'admin' OR email = 'superadmin@kpopstore.com')
AND role != 'admin';

-- ============================================
-- PART 6: CREATE REPORTING VIEWS
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
-- PART 7: HELPER FUNCTIONS
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
-- PART 8: VERIFICATION & SUCCESS MESSAGE
-- ============================================

-- Check if all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM (
    VALUES ('companies'), ('artists'), ('albums'), ('users'), ('orders'), 
           ('order_items'), ('payments'), ('cart_items')
) AS t(table_name)
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = t.table_name
)
ORDER BY table_name;

-- Display admin users
SELECT '👤 ADMIN ACCOUNTS:' as info, username, email, role FROM users WHERE role = 'admin';

-- Success message
SELECT '✅ COMPLETE SETUP SUCCESSFUL!' as status,
       '📦 8 tables created (including cart_items)' as tables,
       '🔍 6 reporting views ready' as views,
       '⚡ 4 helper functions available' as functions,
       '🛒 Cart functionality enabled' as cart,
       '🛡️ Admin roles configured' as admin,
       '📊 Sample data inserted' as data,
       '🛡️ Unique constraints prevent duplicates' as protection,
       '👤 Admin login: admin@kpopstore.com / admin123' as credentials;
