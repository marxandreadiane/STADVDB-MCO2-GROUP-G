# OLAP Auto-Refresh Feature

## Overview

This feature automatically refreshes OLAP (Online Analytical Processing) reports every 5 minutes, ensuring that analytics data stays synchronized with the operational database in Supabase.

## Architecture

```
┌─────────────┐
│  Supabase   │ (Source: OLTP Database)
│  (Remote)   │
└──────┬──────┘
       │
       │ Foreign Data Wrapper (FDW)
       │
┌──────▼──────┐
│ PostgreSQL  │ (Target: OLAP Database)
│  (Local)    │ - Materialized report tables
└──────┬──────┘ - Aggregated analytics data
       │
       │ Automatic Refresh
       │
┌──────▼──────┐
│    OLAP     │ (Scheduled Service)
│ Replicator  │ - Runs every 5 minutes
└─────────────┘ - Updates all report tables
```

## Components

### 1. OLAP Database (`local_postgres`)

- Stores materialized report tables
- Connected to Supabase via Foreign Data Wrapper
- Tables refreshed periodically:
  - `company_sales_report`
  - `album_sales_report`
  - `monthly_sales_report`
  - `top_customers_report`
  - `payment_method_report`
  - `cart_items_detailed`

### 2. OLAP Replicator Service (`olap_replicator`)

- Node.js service running in Docker
- Automatically calls `refresh_all_reports()` every 5 minutes
- Logs refresh status and timestamps
- Handles errors gracefully

### 3. Foreign Data Wrapper (FDW)

- Provides real-time access to Supabase tables
- Configured in `OLAP-SETUP.sql`
- Schema: `supabase_data`

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Supabase database configured
- OLAP-SETUP.sql executed in local PostgreSQL

### Installation

1. **Ensure OLAP database is set up:**

   ```bash
   # Access pgAdmin at http://localhost:5050
   # Login: admin@kpopstore.com / admin123
   # Run OLAP-SETUP.sql in kpop_store database
   ```

2. **Start all services:**

   ```bash
   docker-compose up -d --build
   ```

3. **Verify the OLAP replicator is running:**

   ```bash
   docker logs olap_replicator -f
   ```

   You should see:

   ```
   OLAP Auto-Refresh Service started
   Refresh interval: 5 minutes
   Running initial refresh...
   [timestamp] Starting OLAP refresh...
   [timestamp] OLAP reports refreshed successfully
   ```

## Configuration

### Refresh Interval

Default: 5 minutes

To change the interval, edit `backend/olap-replicator.js`:

```javascript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Examples:
// 1 minute:  1 * 60 * 1000
// 10 minutes: 10 * 60 * 1000
// 1 hour: 60 * 60 * 1000
```

Then rebuild:

```bash
docker-compose up -d --build olap_replicator
```

### Database Connection

The service connects to the local PostgreSQL database using these environment variables:

```env
DB_LOCAL_HOST=postgres
DB_LOCAL_PORT=5432
DB_LOCAL_DATABASE=kpop_store
DB_LOCAL_USER=postgres
DB_LOCAL_PASSWORD=postgres
```

These can be overridden in your `.env` file if needed.

## Usage

### Monitor Refresh Activity

```bash
# Follow live logs
docker logs olap_replicator -f

# View last 50 lines
docker logs olap_replicator --tail 50
```

### Manual Refresh

If you need to refresh immediately without waiting:

```sql
-- In pgAdmin, run:
SELECT refresh_all_reports();
```

Or restart the service to trigger immediate refresh:

```bash
docker-compose restart olap_replicator
```

### Check Data Freshness

Query the OLAP tables to see when they were last updated:

```sql
-- Check all report tables
SELECT
    'company_sales_report' as table_name,
    MAX(last_updated) as last_refresh
FROM company_sales_report
UNION ALL
SELECT 'album_sales_report', MAX(last_updated) FROM album_sales_report
UNION ALL
SELECT 'monthly_sales_report', MAX(last_updated) FROM monthly_sales_report
UNION ALL
SELECT 'top_customers_report', MAX(last_updated) FROM top_customers_report
UNION ALL
SELECT 'payment_method_report', MAX(last_updated) FROM payment_method_report;
```

## Troubleshooting

### Service Not Running

```bash
# Check container status
docker ps | grep olap_replicator

# If not running, start it
docker-compose up -d olap_replicator

# Check for errors
docker logs olap_replicator
```

### Connection Errors

If you see "connection refused" or "database does not exist":

1. Verify PostgreSQL is running:

   ```bash
   docker ps | grep local_postgres
   ```

2. Check if OLAP-SETUP.sql was executed:

   ```sql
   -- In pgAdmin, check if tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_name LIKE '%_report';
   ```

3. Verify Foreign Data Wrapper connection:
   ```sql
   -- Test connection to Supabase
   SELECT COUNT(*) FROM supabase_data.users;
   ```

### Reports Not Updating

If reports show stale data:

1. Check if refresh function exists:

   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'refresh_all_reports';
   ```

2. Manually run refresh to see errors:

   ```sql
   SELECT refresh_all_reports();
   ```

3. Restart the service:
   ```bash
   docker-compose restart olap_replicator
   ```

### High Memory Usage

If the service consumes too much memory:

1. Increase refresh interval (see Configuration section)
2. Limit the number of tables being refreshed
3. Add memory limits in docker-compose.yml:
   ```yaml
   olap_replicator:
     # ... existing config
     mem_limit: 512m
   ```

## Performance Considerations

### Refresh Timing

- **5 minutes**: Good balance for most use cases
- **1 minute**: For near real-time analytics (higher load)
- **15-30 minutes**: For less critical reports (lower load)

### Database Load

Each refresh queries Supabase tables and updates local tables. Monitor:

- Supabase connection count
- Local PostgreSQL performance
- Network bandwidth

### Optimization Tips

1. Index OLAP tables appropriately (already done in OLAP-SETUP.sql)
2. Consider refreshing only changed data (not implemented yet)
3. Run refresh during off-peak hours for large datasets
4. Use materialized views for complex aggregations

## Service Lifecycle

### Startup Sequence

1. Service starts and connects to local PostgreSQL
2. Waits 3 seconds for database readiness
3. Performs initial refresh
4. Schedules periodic refresh every 5 minutes

### Graceful Shutdown

The service handles SIGTERM and SIGINT signals:

```bash
# Graceful stop
docker-compose stop olap_replicator

# Force stop (not recommended)
docker-compose kill olap_replicator
```

### Auto-restart

The service is configured with `restart: unless-stopped`, meaning:

- Restarts automatically if it crashes
- Restarts after Docker daemon restart
- Does NOT restart if manually stopped

## Logs

### Log Format

```
OLAP Auto-Refresh Service started
Refresh interval: 5 minutes
Scheduled refresh every 5 minutes
Running initial refresh...
[2025-11-27T15:11:06.456Z] Starting OLAP refresh...
[2025-11-27T15:11:14.639Z] OLAP reports refreshed successfully
  (Data freshness view not available)
```

### Log Levels

- **Info**: Normal operation (refresh started/completed)
- **Error**: Failures during refresh (with error message)
- **Warning**: Non-critical issues (missing optional views)

### Log Retention

Docker manages log rotation automatically. To view archived logs:

```bash
docker logs olap_replicator --since 1h  # Last hour
docker logs olap_replicator --since "2025-11-27" # Specific date
```

## Development

### Local Testing

Run the service outside Docker for development:

```bash
cd backend

# Set environment variables
export DB_LOCAL_HOST=localhost
export DB_LOCAL_PORT=5432
export DB_LOCAL_DATABASE=kpop_store
export DB_LOCAL_USER=postgres
export DB_LOCAL_PASSWORD=postgres

# Run
node olap-replicator.js
```

### Modifying Refresh Logic

Edit `backend/olap-replicator.js`:

```javascript
async function refreshOLAPReports() {
  // Add custom logic here
  // Example: Refresh only specific tables
  await client.query("SELECT refresh_company_sales_report()");
  await client.query("SELECT refresh_album_sales_report()");
}
```

### Adding New Reports

1. Create new report table in `database/OLAP-SETUP.sql`
2. Create refresh function for the new table
3. Add to `refresh_all_reports()` function
4. Rebuild service: `docker-compose up -d --build olap_replicator`

## Security

### Database Credentials

- Stored in `.env` file (not committed to git)
- Used only for local PostgreSQL connection
- Supabase credentials used via Foreign Data Wrapper

### Network Access

- Service runs in Docker private network
- Only communicates with local PostgreSQL
- No external ports exposed

## Related Files

- `backend/olap-replicator.js` - Main service code
- `database/OLAP-SETUP.sql` - OLAP database schema and functions
- `docker-compose.yml` - Service configuration
- `.env` - Database credentials

## Future Enhancements

Potential improvements:

- [ ] Add real-time refresh on data changes (using Supabase Realtime)
- [ ] Implement incremental refresh (only changed data)
- [ ] Add health check endpoint
- [ ] Create dashboard for monitoring refresh status
- [ ] Support for multiple refresh schedules per table
- [ ] Email/Slack notifications on refresh failures
- [ ] Metrics collection (refresh duration, data volume)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review service logs: `docker logs olap_replicator`
3. Verify OLAP setup: Run queries in pgAdmin
4. Check main project README.md for general setup

## License

This feature is part of the STADVDB-MCO2-GROUP-G project.
