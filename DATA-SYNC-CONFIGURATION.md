# 🔄 Supabase to PostgreSQL Data Sync Configuration

## Overview

This system uses a **pull-based sync approach** that periodically fetches data from Supabase and loads it into your local PostgreSQL database. You have full control over:

- ✅ Which tables to sync
- ✅ How often to sync (interval)
- ✅ Which data to include (filters)
- ✅ Which columns to exclude
- ✅ No Supabase Realtime/Replication features needed!

---

## 🚀 Quick Start

### Default Behavior (No Configuration Needed)

By default, the sync service will:

- Sync **all 7 tables** every **5 minutes**
- Include **all data** from each table
- Include **all columns**

Just run:

```powershell
docker-compose up -d --build
```

That's it! Check logs:

```powershell
docker-compose logs -f replicator
```

---

## ⚙️ Customizing Sync Behavior

Edit `backend/replication.js` and modify the `SYNC_CONFIG` object:

### 1️⃣ Change Sync Interval

```javascript
const SYNC_CONFIG = {
  // Sync every 2 minutes (120000 ms)
  interval: 120000,

  // OR use environment variable
  interval: process.env.SYNC_INTERVAL || 300000,

  // Common intervals:
  // 1 minute:  60000
  // 5 minutes: 300000
  // 10 minutes: 600000
  // 30 minutes: 1800000
  // 1 hour: 3600000
```

**Or set via environment variable in `.env`:**

```bash
SYNC_INTERVAL=120000
```

### 2️⃣ Select Specific Tables

Only sync the tables you need:

```javascript
const SYNC_CONFIG = {
  interval: 300000,

  // Only sync these tables
  tables: ['albums', 'artists', 'companies'],

  // Rest of config...
```

**Example: Only sync product catalog (no user data):**

```javascript
tables: ['companies', 'artists', 'albums'],
```

**Example: Only sync orders and customers:**

```javascript
tables: ['users', 'orders', 'order_items'],
```

### 3️⃣ Filter Data (Most Powerful Feature!)

Sync only specific rows that match your criteria:

#### Example: Only Recent Orders (Last 30 Days)

```javascript
const SYNC_CONFIG = {
  interval: 300000,
  tables: ['companies', 'artists', 'albums', 'users', 'orders', 'order_items'],

  filters: {
    orders: {
      order_date: { gte: '2024-11-01' }
    }
  },
```

#### Example: Only Completed Orders

```javascript
filters: {
  orders: {
    status: { eq: 'DELIVERED' }
  }
},
```

#### Example: Only Albums in Stock

```javascript
filters: {
  albums: {
    stock_quantity: { gt: 0 }
  }
},
```

#### Example: Only Specific Companies

```javascript
filters: {
  companies: {
    name: { in: ['SM Entertainment', 'JYP Entertainment', 'YG Entertainment'] }
  }
},
```

#### Example: Multiple Filters

```javascript
filters: {
  albums: {
    stock_quantity: { gt: 0 },
    price: { lte: 20.00 }
  },
  orders: {
    status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
    order_date: { gte: '2024-01-01' }
  },
  users: {
    role: { eq: 'customer' }
  }
},
```

#### Supported Filter Operators

- `eq`: equals
- `gt`: greater than
- `gte`: greater than or equal
- `lt`: less than
- `lte`: less than or equal
- `in`: in array

### 4️⃣ Exclude Sensitive Columns

Don't sync certain columns (e.g., passwords, personal data):

```javascript
const SYNC_CONFIG = {
  interval: 300000,
  tables: ['companies', 'artists', 'albums', 'users', 'orders', 'order_items'],
  filters: {},

  exclude: {
    users: ['password'],  // Don't sync passwords
  }
},
```

**Example: Exclude multiple columns:**

```javascript
exclude: {
  users: ['password', 'phone', 'address'],
  orders: ['shipping_address', 'phone']
},
```

---

## 📝 Real-World Configuration Examples

### Example 1: Analytics Database (Last 90 Days Only)

Perfect for reporting and analytics without old data:

```javascript
const SYNC_CONFIG = {
  interval: 600000, // Sync every 10 minutes

  tables: ["companies", "artists", "albums", "users", "orders", "order_items"],

  filters: {
    orders: {
      order_date: { gte: "2024-08-28" }, // Last 90 days
    },
  },

  exclude: {
    users: ["password", "phone", "address"], // Privacy
  },
};
```

### Example 2: Product Catalog Only (No Customer Data)

For public-facing search or display:

```javascript
const SYNC_CONFIG = {
  interval: 1800000, // Sync every 30 minutes

  tables: ["companies", "artists", "albums"],

  filters: {
    albums: {
      stock_quantity: { gt: 0 }, // Only available items
    },
  },

  exclude: {},
};
```

### Example 3: Customer Orders Dashboard

For customer service team:

```javascript
const SYNC_CONFIG = {
  interval: 120000, // Sync every 2 minutes (frequent)

  tables: ["users", "orders", "order_items", "albums", "artists"],

  filters: {
    orders: {
      status: { in: ["PENDING", "PAID", "SHIPPED"] }, // Active orders only
    },
    users: {
      role: { eq: "customer" }, // No admin data
    },
  },

  exclude: {
    users: ["password"],
  },
};
```

### Example 4: Sales Analytics (Completed Orders Only)

For finance/reporting:

```javascript
const SYNC_CONFIG = {
  interval: 3600000, // Sync every hour

  tables: ["companies", "artists", "albums", "orders", "order_items"],

  filters: {
    orders: {
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
    },
  },

  exclude: {},
};
```

### Example 5: Full Mirror (Default)

Everything, all the time:

```javascript
const SYNC_CONFIG = {
  interval: 300000, // Every 5 minutes
  tables: [
    "companies",
    "artists",
    "albums",
    "users",
    "orders",
    "order_items",
    "cart_items",
  ],
  filters: {},
  exclude: {},
};
```

---

## 🔧 Advanced Configuration

### Dynamic Date Filters

Sync only recent data automatically:

```javascript
// Calculate 30 days ago
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const SYNC_CONFIG = {
  interval: 300000,
  tables: ["companies", "artists", "albums", "users", "orders", "order_items"],

  filters: {
    orders: {
      order_date: { gte: thirtyDaysAgo.toISOString().split("T")[0] },
    },
  },

  exclude: {},
};
```

### Environment-Based Configuration

Different configs for dev/prod:

```javascript
const isDev = process.env.NODE_ENV === "development";

const SYNC_CONFIG = {
  // Dev: sync every minute, Prod: sync every 5 minutes
  interval: isDev ? 60000 : 300000,

  tables: ["companies", "artists", "albums", "users", "orders", "order_items"],

  filters: isDev
    ? {
        // Dev: only sync test data
        users: { email: { like: "%@test.com" } },
      }
    : {},

  exclude: {
    users: ["password"],
  },
};
```

---

## 📊 Monitoring Your Sync

### View Sync Logs

```powershell
# Live logs
docker-compose logs -f replicator

# Last 100 lines
docker-compose logs --tail=100 replicator
```

### What You'll See

```
🚀 Starting Supabase to PostgreSQL Sync Service...

📋 Configuration:
   - Sync interval: 5 minutes
   - Tables: companies, artists, albums, users, orders, order_items, cart_items

✅ PostgreSQL is ready!

🔄 Starting data sync...

✅ Synced 3 rows from companies
✅ Synced 5 rows from artists
✅ Synced 10 rows from albums
✅ Synced 5 rows from users
✅ Synced 3 rows from orders
✅ Synced 8 rows from order_items
⚪ No data in cart_items

✅ Sync complete! 6/7 tables synced (34 total records) in 2.45s

⏰ Scheduled sync every 5 minutes

🎯 Sync service is running and monitoring...

⏰ [11/27/2025, 3:05:00 PM] Starting scheduled sync...
```

### Verify Data in pgAdmin

1. Open http://localhost:5050
2. Connect to Local PostgreSQL
3. Run:

```sql
-- Check sync timestamps (add this column if needed)
SELECT
    'companies' as table_name, COUNT(*) FROM companies
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT 'albums', COUNT(*) FROM albums
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

---

## 🎯 Trigger Manual Sync

### Restart the Replicator

```powershell
docker-compose restart replicator
```

This will:

1. Stop the service
2. Immediately perform a full sync
3. Resume scheduled syncs

### Force Sync Without Restart

Connect to the container and trigger sync:

```powershell
# Not directly supported, but you can restart the service
docker-compose restart replicator
```

---

## 🔍 Troubleshooting

### Problem: No Data Syncing

**Check 1: Are filters too restrictive?**

```javascript
// Temporarily remove filters to test
filters: {},
```

**Check 2: Check Supabase connection**

```powershell
docker-compose logs replicator | findstr "Error"
```

**Check 3: Verify .env credentials**

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Problem: Sync Takes Too Long

**Solution: Reduce data volume**

```javascript
// Add filters to limit data
filters: {
  orders: {
    order_date: {
      gte: "2024-11-01";
    }
  }
}
```

### Problem: Out of Memory

**Solution: Sync fewer tables at once**

```javascript
// Split into batches
tables: ['companies', 'artists', 'albums'], // Batch 1
```

Then create a second replicator service for other tables.

---

## 📚 Filter Examples Cheat Sheet

```javascript
// Equals
{ column: { eq: 'value' } }

// Greater than
{ column: { gt: 10 } }
{ column: { gte: 10 } }

// Less than
{ column: { lt: 100 } }
{ column: { lte: 100 } }

// In array
{ column: { in: ['value1', 'value2'] } }

// Date range
{
  created_at: { gte: '2024-01-01' },
  created_at: { lte: '2024-12-31' }
}

// Multiple conditions
{
  price: { gte: 10, lte: 20 },
  stock_quantity: { gt: 0 }
}
```

---

## ✅ Summary

**You now have a flexible data sync system that:**

- ✅ Doesn't require Supabase Realtime (alpha) features
- ✅ Pulls only the data you need
- ✅ Runs on your schedule
- ✅ Filters data at the source
- ✅ Excludes sensitive columns
- ✅ Works with any Supabase plan

**To customize:**

1. Edit `backend/replication.js`
2. Modify `SYNC_CONFIG` object
3. Run `docker-compose up -d --build`
4. Monitor with `docker-compose logs -f replicator`

**Next Steps:**

- Try the examples above
- Adjust sync interval for your needs
- Add filters to reduce data volume
- Use pgAdmin to query synced data

Happy syncing! 🎉
