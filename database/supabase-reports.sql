-- REPORTS DATABASE SCHEMA (PostgreSQL version for Supabase)
-- This creates views/tables for analytics and reporting

-- Create views or materialized views for reports
-- Note: In a single database setup, we create these alongside the main tables

-- 1. Company Sales Report View
CREATE OR REPLACE VIEW company_sales_report AS
SELECT 
    c.name as company_name,
    SUM(oi.quantity * oi.price) as total_sales,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT al.album_id) as albums_sold
FROM companies c
LEFT JOIN artists ar ON c.company_id = ar.company_id
LEFT JOIN albums al ON ar.artist_id = al.artist_id
LEFT JOIN order_items oi ON al.album_id = oi.album_id
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.status IN ('PAID', 'SHIPPED')
GROUP BY c.company_id, c.name;

-- 2. Album Sales Report View
CREATE OR REPLACE VIEW album_sales_report AS
SELECT 
    al.title as album_name,
    ar.name as artist_name,
    c.name as company_name,
    SUM(oi.quantity) as sales_count,
    SUM(oi.quantity * oi.price) as total_revenue,
    al.price as unit_price
FROM albums al
LEFT JOIN artists ar ON al.artist_id = ar.artist_id
LEFT JOIN companies c ON ar.company_id = c.company_id
LEFT JOIN order_items oi ON al.album_id = oi.album_id
LEFT JOIN orders o ON oi.order_id = o.order_id
WHERE o.status IN ('PAID', 'SHIPPED')
GROUP BY al.album_id, al.title, ar.name, c.name, al.price;

-- 3. Monthly Sales Report View
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT 
    DATE_TRUNC('month', o.order_date) as month,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value
FROM orders o
WHERE o.status IN ('PAID', 'SHIPPED')
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;

-- 4. Top Customers Report View
CREATE OR REPLACE VIEW top_customers_report AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.status IN ('PAID', 'SHIPPED')
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
GROUP BY p.method
ORDER BY total_amount DESC;

-- Success message
SELECT 'Reports schema created successfully!' as message;
