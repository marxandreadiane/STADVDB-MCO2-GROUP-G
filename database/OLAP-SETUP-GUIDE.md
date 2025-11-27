# OLAP Database Setup Guide

This guide will help you set up a separate OLAP database in your local PostgreSQL that pulls data from Supabase.

## Architecture Overview

```
┌─────────────┐
│  Supabase   │ (OLTP - Online Transaction Processing)
│  (Remote)   │ - Real-time transactions
└──────┬──────┘ - User orders, cart, etc.
       │
       │ Foreign Data Wrapper (FDW)
       │
┌──────▼──────┐
│ PostgreSQL  │ (OLAP - Online Analytical Processing)
│  (Local)    │ - Analytics & Reporting
│  Docker     │ - Aggregated data tables
└─────────────┘
       │
       │
┌──────▼──────┐
│   pgAdmin   │ http://localhost:5050
│  (Local)    │ - Manage & Query OLAP DB
└─────────────┘
```

## Step-by-Step Setup

### 1. Access pgAdmin

1. Open your browser and go to: **http://localhost:5050**
2. Login with:
   - **Email:** `admin@kpopstore.com`
   - **Password:** `admin123`

### 2. Connect to Local PostgreSQL

1. In pgAdmin, right-click **Servers** → **Register** → **Server**
2. Fill in the connection details:

   **General Tab:**

   - Name: `Local PostgreSQL (OLAP)`

   **Connection Tab:**

   - Host: `postgres` (or `localhost` if connecting from outside Docker)
   - Port: `5432`
   - Maintenance database: `kpop_store`
   - Username: `postgres`
   - Password: `postgres`

3. Click **Save**

### 3. Update Supabase Connection in OLAP-SETUP.sql

Before running the script, you need to update the Supabase connection details:

1. Open `OLAP-SETUP.sql` in VS Code
2. Find **PART 0: SETUP FOREIGN DATA WRAPPER** (around line 10)
3. Update these lines with your actual Supabase credentials:

```sql
CREATE SERVER IF NOT EXISTS supabase_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (
        host 'your-supabase-host.supabase.com',  -- Update this
        port '6543',                               -- Update if different
        dbname 'postgres',
        sslmode 'require'
    );

CREATE USER MAPPING IF NOT EXISTS FOR postgres
    SERVER supabase_server
    OPTIONS (
        user 'postgres.your-project-ref',  -- Update this
        password 'your-supabase-password'  -- Update this
    );
```

**How to get Supabase credentials:**

- Go to your Supabase project dashboard
- Navigate to **Settings** → **Database**
- Find the **Connection Info** section
- Use the **Connection string** values:
  - Host: Extract from connection string (e.g., `aws-0-ap-southeast-1.pooler.supabase.com`)
  - Port: Usually `6543` for pooler or `5432` for direct
  - User: Should match your `.env` file (`DB_MAIN_USER`)
  - Password: Should match your `.env` file (`DB_MAIN_PASS`)

### 4. Run the OLAP Setup Script

1. In pgAdmin, expand **Servers** → **Local PostgreSQL (OLAP)** → **Databases** → **kpop_store**
2. Right-click on **kpop_store** → **Query Tool**
3. Copy the entire contents of `OLAP-SETUP.sql`
4. Paste into the Query Tool
5. Click the **Execute** button (⚡ icon) or press `F5`

### 5. Verify the Setup

After running the script, you should see:

1. **Foreign Schema:** `supabase_data` (contains references to Supabase tables)
2. **OLAP Tables:**
   - `company_sales_report`
   - `album_sales_report`
   - `monthly_sales_report`
   - `top_customers_report`
   - `payment_method_report`
   - `cart_items_detailed`

To verify in pgAdmin:

```sql
-- Check if foreign tables are accessible
SELECT * FROM supabase_data.companies LIMIT 5;

-- Check if OLAP tables exist (will be empty initially)
SELECT * FROM company_sales_report;
```

### 6. Populate the OLAP Tables

Run the refresh function to pull data from Supabase:

```sql
-- Refresh all reports at once
SELECT refresh_all_reports();

-- Or refresh individually
SELECT refresh_company_sales_report();
SELECT refresh_album_sales_report();
SELECT refresh_monthly_sales_report();
SELECT refresh_top_customers_report();
SELECT refresh_payment_method_report();
SELECT refresh_cart_items_detailed();
```

### 7. Query Your OLAP Data

Now you can run analytics queries:

```sql
-- Top selling companies
SELECT * FROM company_sales_report ORDER BY total_sales DESC;

-- Monthly revenue trends
SELECT * FROM monthly_sales_report ORDER BY month DESC;

-- Best customers
SELECT * FROM top_customers_report ORDER BY total_spent DESC LIMIT 10;

-- Album performance
SELECT * FROM album_sales_report WHERE sales_count > 0 ORDER BY total_revenue DESC;
```

## Maintenance & Scheduling

### Manual Refresh

Whenever you want fresh data from Supabase:

```sql
SELECT refresh_all_reports();
```

### Automated Refresh (Optional)

To automatically refresh data every hour, create a scheduled job using `pg_cron`:

1. Install pg_cron extension (if not already installed):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

2. Schedule the refresh:

```sql
-- Refresh every hour
SELECT cron.schedule('refresh-olap-reports', '0 * * * *', 'SELECT refresh_all_reports()');
```

## Troubleshooting

### Error: "could not connect to server"

**Problem:** Cannot connect to Supabase through FDW

**Solutions:**

1. Check your Supabase credentials in the script
2. Ensure your local Docker container can reach Supabase (internet connectivity)
3. Verify SSL mode is set to 'require'
4. Try using direct connection instead of pooler (port 5432 instead of 6543)

### Error: "relation does not exist"

**Problem:** Foreign tables not imported correctly

**Solutions:**

1. Check if the tables exist in Supabase
2. Verify table names match exactly (case-sensitive)
3. Re-run the `IMPORT FOREIGN SCHEMA` part of the script

### Error: "password authentication failed"

**Problem:** Wrong credentials

**Solutions:**

1. Double-check your Supabase password
2. Make sure you're using the correct user (should include project reference)
3. Check if your Supabase project is active

### Empty OLAP Tables

**Problem:** Tables created but no data

**Solutions:**

1. Make sure you ran `SELECT refresh_all_reports();`
2. Check if Supabase has data: `SELECT COUNT(*) FROM supabase_data.companies;`
3. Look for errors in the pgAdmin messages panel

## Performance Tips

1. **Refresh Schedule:** Don't refresh too frequently (every 5-15 minutes is usually sufficient)
2. **Indexes:** The script creates indexes automatically, but you can add more based on your query patterns
3. **Materialized Views:** For very large datasets, consider using materialized views instead of tables
4. **Partitioning:** For historical data (like cart snapshots), consider partitioning by date

## Security Notes

- The FDW stores Supabase credentials in PostgreSQL system catalogs
- Only local PostgreSQL users can access this connection
- Since this is running in Docker on localhost, it's relatively secure
- **Never commit** files containing real Supabase credentials to Git

## Next Steps

- Create custom analytics queries for your business needs
- Build dashboards using tools like Metabase, Grafana, or custom frontend
- Add more OLAP tables for specific reporting requirements
- Set up alerts for key metrics (low stock, high-value orders, etc.)

## Support

If you encounter issues:

1. Check the pgAdmin **Messages** tab for detailed error information
2. Verify Docker containers are running: `docker-compose ps`
3. Check container logs: `docker-compose logs postgres`
4. Ensure Supabase project is accessible from your network
