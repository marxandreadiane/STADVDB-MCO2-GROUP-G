# PostgreSQL Data Sync Setup Guide

## ✅ Implementation Complete!

I've successfully implemented a **pull-based data sync** from Supabase to a local PostgreSQL database. Here's what was added:

### Files Created/Modified:

1. **`backend/package.json`** - Added `@supabase/supabase-js` dependency
2. **`backend/replication.js`** - Configurable sync service with filters
3. **`database/local-init.sql`** - Schema initialization for local PostgreSQL
4. **`docker-compose.yml`** - Added PostgreSQL + Sync service + pgAdmin
5. **`DATA-SYNC-CONFIGURATION.md`** - Complete customization guide

---

## 🚀 Next Steps - What You Need to Do:

### ⚠️ NO Supabase Realtime Setup Needed!

**This solution uses a pull-based approach** - it periodically fetches data from Supabase using regular queries. No alpha features required!

### Step 1: Deploy the Services

```powershell
# Stop existing services
docker-compose down

# Rebuild and start with new services
docker-compose up -d --build

# View logs to monitor the sync
docker-compose logs -f replicator
```

### Step 2: Verify Data Sync is Working

```powershell
# Check replicator logs
docker-compose logs replicator

# You should see:
# ✅ PostgreSQL is ready!
# ✅ Synced X rows from companies
# ✅ Synced X rows from artists
# ... etc
# ✅ Sync complete! 7/7 tables synced (X total records)
# ⏰ Scheduled sync every 5 minutes
# 🎯 Sync service is running and monitoring...
```

### Step 3: Customize Your Sync (Optional)

**Option A: Using pgAdmin (Recommended - Easy GUI)**

1. Open your browser and go to: **http://localhost:5050**
2. Login with:
   - Email: `admin@kpopstore.com`
   - Password: `admin123`
3. Click **"Add New Server"**
4. In the **"General"** tab:
   - Name: `Local PostgreSQL`
5. In the **"Connection"** tab:
   - Host: `postgres`
   - Port: `5432`
   - Database: `kpop_store`
   - Username: `postgres`
   - Password: `postgres`
6. Click **"Save"**
7. Expand the server → Databases → kpop_store → Schemas → public → Tables
8. Right-click any table (e.g., `albums`) → View/Edit Data → All Rows

**Option B: Using Command Line**

**Connect to local PostgreSQL:**

```powershell
docker exec -it local_postgres psql -U postgres -d kpop_store
```

**Run some queries:**

```sql
-- Check table counts
SELECT 'companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT 'albums', COUNT(*) FROM albums
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Exit
\q
```

**Want to customize what data gets synced?** See **`DATA-SYNC-CONFIGURATION.md`** for:

- Filtering specific data (e.g., only recent orders)
- Changing sync interval
- Excluding sensitive columns
- Syncing only specific tables

### Step 4: Test the Sync

1. Open your app: http://localhost:3000
2. Login as admin: `admin@kpopstore.com` / `admin123`
3. Add a new album via the Admin dashboard
4. Check the replicator logs: `docker-compose logs replicator`
5. You should see: `✅ INSERT on albums: ID <album_id>`
6. Refresh the table in pgAdmin (or re-run the query) to see the new album

---

**Test periodic sync:**

1. Open your app: http://localhost:3000
2. Login as admin: `admin@kpopstore.com` / `admin123`
3. Add a new album via the Admin dashboard
4. Wait for next sync (default: 5 minutes) OR restart replicator: `docker-compose restart replicator`
5. Refresh the table in pgAdmin to see the new album

---

## 📊 Architecture Overview

```
┌─────────────┐                              ┌──────────────┐
│  Supabase   │ ←──── Periodic Fetch ─────── │  Sync Service│
│ (Cloud PG)  │       (Every 5 min)          │  (Replicator)│
└─────────────┘                              └──────┬───────┘
      ↑                                            ↓
      │                                     ┌──────────────┐
      │                                     │   Local PG   │
      │                                     │  (Port 5432) │
      │                                     └──────┬───────┘
      │                                            │
┌─────┴─────┐                               ┌─────┴────────┐
│  Backend  │  ← Still connects to Supabase │   pgAdmin    │
│   API     │     (no changes to app logic) │ (Port 5050)  │
└───────────┘                               └──────────────┘
```

### How It Works:

1. **Periodic Sync**: Every 5 minutes (configurable), fetches data from Supabase
2. **Selective Sync**: You can filter which data to sync (e.g., only recent orders)
3. **One-Way**:
   - App → Supabase (as before)
   - Supabase → Local PostgreSQL (automatic sync)

---

## 🔍 Useful Commands

### View Service Status

```powershell
docker-compose ps
```

### View Replicator Logs (live)

```powershell
docker-compose logs -f replicator
```

### View PostgreSQL Logs

```powershell
docker-compose logs -f postgres
```

### View pgAdmin Logs

```powershell
docker-compose logs -f pgadmin
```

### Restart Services

```powershell
docker-compose restart replicator  # Restart replicator only
docker-compose restart postgres    # Restart PostgreSQL only
docker-compose restart pgadmin     # Restart pgAdmin only
```

### Connect to Local Database (CLI)

```powershell
docker exec -it local_postgres psql -U postgres -d kpop_store
```

### Check Database Size

```powershell
docker exec -it local_postgres psql -U postgres -d kpop_store -c "SELECT pg_size_pretty(pg_database_size('kpop_store'));"
```

### Access pgAdmin Web Interface

Open in browser: **http://localhost:5050**

- Email: `admin@kpopstore.com`
- Password: `admin123`

---

## 🛠️ Troubleshooting

### Issue: Sync service keeps restarting

**Solution:** Check if PostgreSQL is healthy

```powershell
docker-compose ps
docker-compose logs postgres
```

### Issue: No data appearing in local database

**Solution:**

1. Check sync logs: `docker-compose logs replicator`
2. Verify `.env` has correct Supabase credentials
3. Check if Supabase tables have data
4. Try manual sync: `docker-compose restart replicator`

### Issue: Sync takes too long

**Solution:** Add filters to reduce data volume - see `DATA-SYNC-CONFIGURATION.md`

### Issue: Want more frequent syncs

**Solution:** Edit `backend/replication.js`:

```javascript
interval: 60000, // Sync every 1 minute
```

Then rebuild: `docker-compose up -d --build`

---

## 📝 Important Notes

- ✅ Your existing app continues to work exactly as before
- ✅ Backend still connects to Supabase (no changes needed)
- ✅ Local PostgreSQL is for analytics/backup purposes
- ✅ Sync is **one-way**: Supabase → Local PostgreSQL
- ✅ **No Supabase Realtime/alpha features required!**
- ⚠️ Don't modify data in local PostgreSQL (changes won't sync back)
- ⚠️ Local database data is in a Docker volume (persists across restarts)
- ⚠️ Default sync interval is 5 minutes (configurable)

---

## 🔐 Connection Details

**pgAdmin Web Interface:**

- URL: http://localhost:5050
- Email: `admin@kpopstore.com`
- Password: `admin123`

**Local PostgreSQL (via pgAdmin or CLI):**

- Host: `localhost` (from your machine) or `postgres` (from within Docker)
- Port: `5432`
- Database: `kpop_store`
- User: `postgres`
- Password: `postgres`

**Supabase (unchanged):**

- Uses credentials from `.env` file
- App continues to connect to Supabase

---

## 🎯 Use Cases for Local PostgreSQL

1. **Analytics**: Run complex queries without affecting Supabase performance
2. **Backup**: Local copy of your data
3. **Testing**: Query data without risking production database
4. **Development**: Experiment with SQL queries locally
5. **Reporting**: Generate reports from local database
6. **GUI Management**: Use pgAdmin to visually explore and query data
7. **Learning**: Practice SQL without worrying about breaking production

---

## ✅ Summary

Everything is set up and ready to go! Just run the commands in **Step 1** to deploy.

**Key Features:**

- ✅ No Supabase Realtime/alpha features needed
- ✅ Pull-based sync (queries Supabase periodically)
- ✅ Fully configurable (filters, intervals, tables)
- ✅ Works with any Supabase plan

Your app will continue working exactly as before, but now you'll have a synchronized local PostgreSQL database! 🎉

**Next Steps:**

- Deploy: `docker-compose up -d --build`
- Customize: See `DATA-SYNC-CONFIGURATION.md`
- Query: Use pgAdmin at http://localhost:5050

---

## 🖥️ pgAdmin Quick Start Guide

### First Time Setup

1. **Access pgAdmin**: Open http://localhost:5050 in your browser
2. **Login**: Use `admin@kpopstore.com` / `admin123`
3. **Add Server**:
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab**:
     - Name: `Local PostgreSQL`
   - **Connection Tab**:
     - Host: `postgres`
     - Port: `5432`
     - Database: `kpop_store`
     - Username: `postgres`
     - Password: `postgres`
   - Click "Save"

### Common Tasks in pgAdmin

**View Table Data:**

1. Expand: Servers → Local PostgreSQL → Databases → kpop_store → Schemas → public → Tables
2. Right-click on any table (e.g., `albums`)
3. Select "View/Edit Data" → "All Rows"

**Run SQL Queries:**

1. Right-click on `kpop_store` database
2. Select "Query Tool"
3. Type your SQL and press F5 or click ▶️ Execute

**Useful Queries to Try:**

```sql
-- View all albums with artist and company info
SELECT a.title, ar.name as artist, c.name as company, a.price, a.stock_quantity
FROM albums a
JOIN artists ar ON a.artist_id = ar.artist_id
JOIN companies c ON ar.company_id = c.company_id
ORDER BY a.title;

-- Check total revenue
SELECT SUM(total_amount) as total_revenue
FROM orders
WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED');

-- Top selling albums
SELECT * FROM album_sales_report
ORDER BY sales_count DESC
LIMIT 10;

-- Company performance
SELECT * FROM company_sales_report
ORDER BY total_sales DESC;
```

**Export Data:**

1. Right-click on a table
2. Select "Import/Export"
3. Choose format (CSV, JSON, etc.)

**Monitor Real-Time Changes:**

1. Keep a Query Tool open with a SELECT query
2. Make changes in your app
3. Re-run the query (F5) to see updated data

### pgAdmin Tips

- 🔍 Use **Ctrl+F** to search within query results
- 📊 Use **View → Graph Visualiser** to see table relationships
- 💾 Queries are auto-saved in pgAdmin's history
- 🔄 Press **F5** to refresh/re-run queries
- 📋 Right-click on table → "Scripts" → "SELECT" to auto-generate queries
