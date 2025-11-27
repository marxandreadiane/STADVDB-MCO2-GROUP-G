# 🖥️ pgAdmin Setup & Usage Guide

## Quick Access

**URL**: http://localhost:5050

**Login Credentials:**

- Email: `admin@kpopstore.com`
- Password: `admin123`

---

## 🚀 Initial Setup (First Time Only)

### Step 1: Access pgAdmin

1. Make sure Docker is running: `docker-compose up -d`
2. Open your browser and go to: http://localhost:5050
3. Login with the credentials above

### Step 2: Connect to Local PostgreSQL

1. In pgAdmin, right-click **"Servers"** (left sidebar)
2. Select **"Register"** → **"Server"**
3. Fill in the connection details:

**General Tab:**

- Name: `Local PostgreSQL`

**Connection Tab:**

- Host name/address: `postgres`
- Port: `5432`
- Maintenance database: `kpop_store`
- Username: `postgres`
- Password: `postgres`
- Save password: ✅ (check this box)

4. Click **"Save"**

---

## 📊 Exploring Your Database

### View Tables

1. Expand in left sidebar:

   ```
   Servers
   └── Local PostgreSQL
       └── Databases
           └── kpop_store
               └── Schemas
                   └── public
                       └── Tables
   ```

2. You'll see all your tables:
   - `albums`
   - `artists`
   - `cart_items`
   - `companies`
   - `order_items`
   - `orders`
   - `payments`
   - `users`

### View Table Data

**Option 1: Quick View**

- Right-click on any table (e.g., `albums`)
- Select **"View/Edit Data"** → **"All Rows"**

**Option 2: Limited Rows**

- Right-click on table
- Select **"View/Edit Data"** → **"First 100 Rows"**

### View Table Structure

- Right-click on table
- Select **"Properties"**
- Click on **"Columns"** tab to see all fields

---

## 🔍 Running SQL Queries

### Open Query Tool

1. Right-click on `kpop_store` database
2. Select **"Query Tool"**
3. A new tab opens where you can write SQL

### Execute Queries

- Write your SQL query
- Press **F5** or click the **▶️ Execute** button
- Results appear in the bottom panel

### Sample Queries

**View all albums with full details:**

```sql
SELECT
    a.album_id,
    a.title,
    ar.name as artist,
    c.name as company,
    a.price,
    a.stock_quantity,
    a.release_date
FROM albums a
JOIN artists ar ON a.artist_id = ar.artist_id
JOIN companies c ON ar.company_id = c.company_id
ORDER BY a.release_date DESC;
```

**Check total revenue:**

```sql
SELECT
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM orders
WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED');
```

**Top 5 customers by spending:**

```sql
SELECT * FROM top_customers_report
LIMIT 5;
```

**Low stock albums (< 20 units):**

```sql
SELECT
    title,
    stock_quantity,
    price
FROM albums
WHERE stock_quantity < 20
ORDER BY stock_quantity ASC;
```

**Recent orders:**

```sql
SELECT
    o.order_id,
    u.username,
    u.email,
    o.order_date,
    o.status,
    o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY o.order_date DESC
LIMIT 10;
```

**Company sales report:**

```sql
SELECT * FROM company_sales_report
ORDER BY total_sales DESC;
```

**Album sales report:**

```sql
SELECT * FROM album_sales_report
WHERE sales_count > 0
ORDER BY total_revenue DESC;
```

---

## 📈 Using Pre-Built Views

Your database has several reporting views already created:

### 1. Company Sales Report

```sql
SELECT * FROM company_sales_report;
```

### 2. Album Sales Report

```sql
SELECT * FROM album_sales_report;
```

### 3. Monthly Sales Report

```sql
SELECT * FROM monthly_sales_report;
```

### 4. Top Customers Report

```sql
SELECT * FROM top_customers_report;
```

### 5. Payment Method Report

```sql
SELECT * FROM payment_method_report;
```

### 6. Cart Items Detailed

```sql
SELECT * FROM cart_items_detailed;
```

---

## 🛠️ Common Tasks

### Search/Filter Data

**In the data grid:**

1. View table data (View/Edit Data → All Rows)
2. Click the **🔍 Filter** icon in toolbar
3. Add filter conditions
4. Click **OK**

**Using SQL:**

```sql
-- Find albums by artist
SELECT * FROM albums
WHERE title ILIKE '%love%';

-- Find users by role
SELECT * FROM users
WHERE role = 'admin';

-- Find orders in specific date range
SELECT * FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2025-01-01';
```

### Export Data

1. Right-click on table → **"Import/Export Data"**
2. Switch to **"Export"** tab
3. Choose format: CSV, Binary, or Text
4. Select output file location
5. Choose which columns to export
6. Click **"OK"**

### Copy Query Results

1. Run your query
2. In the results panel, select rows (Ctrl+A for all)
3. Right-click → **"Copy"** → **"Copy with headers"**
4. Paste into Excel or any text editor

### View Query History

1. Click on **"Query History"** tab (bottom of Query Tool)
2. See all previously run queries
3. Double-click any query to re-run it

### Save Queries

1. Write your query in Query Tool
2. Click **💾 Save** icon
3. Give it a name
4. Access later from **File** → **"Open File"**

---

## 🎯 pgAdmin Pro Tips

### Keyboard Shortcuts

- **F5** - Execute query
- **F7** - Format SQL (prettify)
- **F8** - Execute current statement only
- **Ctrl+Space** - Auto-complete
- **Ctrl+/** - Comment/uncomment line
- **Ctrl+Shift+C** - Copy query results
- **Ctrl+F** - Find in results

### Auto-Generate Queries

1. Right-click on any table
2. Select **"Scripts"** → **"SELECT Script"**
3. pgAdmin auto-generates a SELECT query for you
4. Modify as needed

### Visual Query Builder

1. In Query Tool, click **"Graph Visualiser"** icon
2. See a visual representation of your query
3. Great for understanding JOIN relationships

### Multiple Query Tool Windows

- You can open multiple Query Tool tabs
- Right-click `kpop_store` → **"Query Tool"** (repeat as needed)
- Useful for comparing results or running parallel queries

### Custom Filters

When viewing table data:

1. Click **🔍 Filter** icon
2. Set conditions like:
   - `price > 15.00`
   - `stock_quantity < 50`
   - `status = 'PAID'`
3. Save filter for reuse

---

## 🔄 Monitoring Real-Time Replication

### Watch Changes Live

1. Open Query Tool
2. Run a query (e.g., `SELECT * FROM albums ORDER BY album_id DESC LIMIT 10`)
3. Keep this window open
4. In your app, add a new album via Admin dashboard
5. Back in pgAdmin, press **F5** to refresh
6. See the new album appear!

### Check Replication Status

```sql
-- Total record counts
SELECT
    'companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT 'albums', COUNT(*) FROM albums
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items;
```

### Latest Entries

```sql
-- Most recently added albums
SELECT * FROM albums
ORDER BY album_id DESC
LIMIT 5;

-- Most recent orders
SELECT * FROM orders
ORDER BY order_date DESC
LIMIT 5;

-- Recent user registrations
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🐛 Troubleshooting

### Can't Access http://localhost:5050

**Check if pgAdmin is running:**

```powershell
docker-compose ps
```

**Restart pgAdmin:**

```powershell
docker-compose restart pgadmin
```

**Check logs:**

```powershell
docker-compose logs pgadmin
```

### "Could not connect to server"

**Issue**: Can't connect to PostgreSQL from pgAdmin

**Solution**: Make sure you use `postgres` as the hostname (not `localhost`)

- ✅ Correct: Host = `postgres`
- ❌ Wrong: Host = `localhost`

### Login Page Won't Load

**Clear browser cache:**

- Press `Ctrl+Shift+Delete`
- Clear cookies and cache
- Try accessing http://localhost:5050 again

### Forgot pgAdmin Password

**Reset pgAdmin:**

```powershell
docker-compose down
docker volume rm stadvdb-mco2-group-g_pgadmin_data
docker-compose up -d
```

Then set up the server connection again.

---

## 📚 Additional Resources

### pgAdmin Documentation

- Official Docs: https://www.pgadmin.org/docs/

### PostgreSQL Tutorials

- Learn SQL: https://www.postgresqltutorial.com/

### Sample Queries for Your Schema

**Get cart value for specific user:**

```sql
SELECT get_cart_total(1);  -- Replace 1 with user_id
```

**Get cart item count for user:**

```sql
SELECT get_cart_count(1);  -- Replace 1 with user_id
```

**Find albums by price range:**

```sql
SELECT title, price, stock_quantity
FROM albums
WHERE price BETWEEN 15.00 AND 20.00
ORDER BY price;
```

**Users who never placed orders:**

```sql
SELECT u.user_id, u.username, u.email
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL
  AND u.role = 'customer';
```

---

## ✅ Quick Reference Card

| Task               | Action                            |
| ------------------ | --------------------------------- |
| **Open pgAdmin**   | http://localhost:5050             |
| **Login**          | admin@kpopstore.com / admin123    |
| **View table**     | Right-click → View/Edit Data      |
| **Run query**      | Right-click DB → Query Tool → F5  |
| **Export data**    | Right-click table → Import/Export |
| **Filter results** | Click 🔍 icon in data view        |
| **Format SQL**     | F7 in Query Tool                  |
| **Auto-complete**  | Ctrl+Space                        |
| **Refresh query**  | F5                                |

---

**Happy querying! 🎉**
