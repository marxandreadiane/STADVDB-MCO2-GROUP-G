# Database Schema

This folder contains PostgreSQL schema and setup scripts for the Supabase cloud database.

## Files

### `FINAL-COMPLETE-SETUP.sql` ⭐ **USE THIS**
**Complete all-in-one database setup script** including:
- Full schema with all tables and constraints
- Albums with UNIQUE constraint to prevent duplicates
- Stock management (stock_quantity field)
- Sample seed data (companies, artists, albums, users, orders)
- Analytics views for reports
- Safe UPSERT logic (ON CONFLICT DO UPDATE)

**Features:**
- ✅ Idempotent (safe to run multiple times)
- ✅ Prevents duplicate albums with `UNIQUE(title, artist_id)` constraint
- ✅ UPSERT pattern updates existing records instead of creating duplicates
- ✅ Stock quantity tracking for inventory management
- ✅ Foreign key constraints for data integrity
- ✅ Role-based user system (admin/customer)

### `IMAGE-MANAGEMENT-GUIDE.md`
Guide for managing album cover images:
- Using Supabase Storage buckets
- Direct URL approach (current implementation)
- Image upload strategies

## How to Use

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire content of `FINAL-COMPLETE-SETUP.sql`
5. Click **"Run"**
6. Verify success messages in output

**That's it!** The script handles everything in one go.

## Database Schema Overview

### Core Tables

- **`companies`** - K-Pop entertainment agencies (SM, JYP, YG, etc.)
- **`artists`** - K-Pop artists and groups, linked to companies
- **`albums`** - Album catalog with prices, stock, and release dates
  - **UNIQUE constraint:** Prevents duplicate albums (same title + artist)
  - **Stock tracking:** `stock_quantity` field for inventory management
- **`users`** - User accounts with email, password, and role (admin/customer)
- **`cart_items`** - Database-backed shopping carts
- **`orders`** - Customer orders with status tracking
- **`order_items`** - Line items for each order
- **`payments`** - Payment records linked to orders

### Analytics Views

- **`company_sales_report`** - Sales by company
- **`album_sales_report`** - Top selling albums
- **`monthly_sales_report`** - Sales trends by month
- **`top_customers_report`** - Customer purchase rankings
- **`payment_method_stats`** - Payment method distribution

## Key Features

### UNIQUE Constraint
The `albums` table has a unique constraint on `(title, artist_id)` to prevent duplicate albums:

```sql
CONSTRAINT unique_album_per_artist UNIQUE (title, artist_id)
```

This ensures that the same album title cannot exist twice for the same artist, even if the script is run multiple times.

### UPSERT Pattern
The script uses PostgreSQL's `ON CONFLICT DO UPDATE` for safe re-runs:

```sql
INSERT INTO albums (title, artist_id, ...) 
VALUES ('Album Name', 1, ...)
ON CONFLICT (title, artist_id) 
DO UPDATE SET 
  image_url = COALESCE(albums.image_url, EXCLUDED.image_url),
  price = EXCLUDED.price,
  stock_quantity = albums.stock_quantity + EXCLUDED.stock_quantity;
```

This means:
- ✅ First run: Inserts new albums
- ✅ Subsequent runs: Updates prices, adds stock, preserves images
- ✅ No duplicate errors

### Stock Management
Albums now track inventory with `stock_quantity`:
- Stock decrements when orders are placed
- Validation prevents overselling
- UI shows stock indicators (In Stock / Low Stock / Out of Stock)

### Role-Based Access
Users have a `role` field:
- **`customer`** - Regular users (default)
- **`admin`** - Access to admin dashboard and CRUD operations

## Default Sample Data

### Companies (3)
- SM Entertainment
- JYP Entertainment  
- YG Entertainment

### Artists (5)
- EXO (SM)
- Red Velvet (SM)
- TWICE (JYP)
- Stray Kids (JYP)
- BLACKPINK (YG)

### Albums (10)
- Various K-Pop albums with prices $14.99-$19.99
- Stock quantities: 20-50 units each
- Cover images via direct URLs

### Users (5)
- 2 Admin accounts (admin@kpopstore.com, superadmin@kpopstore.com)
- 3 Customer accounts (fan123@email.com, music@email.com, collector@email.com)

## Troubleshooting

### "Relation already exists" errors
- **Not a problem!** The script handles this with `IF NOT EXISTS` and `ON CONFLICT`
- Just check the success messages at the end

### Duplicate albums from old runs
- The UNIQUE constraint now prevents this
- Old duplicates can be manually removed via Supabase Table Editor

### Connection issues
- Verify Supabase project is active
- Check `.env` file has correct credentials
- Ensure `DB_SSL=true` is set

## Database Info

- **Type:** PostgreSQL 15
- **Platform:** Supabase (Cloud-hosted)
- **Connection:** Transaction pooler on port 6543
- **SSL:** Required (`DB_SSL=true`)
- **Connection details:** See `.env` file in root directory

## Migration Notes

If upgrading from an older version:
1. The new schema includes the UNIQUE constraint
2. You may need to manually remove duplicate albums first
3. Stock management requires `stock_quantity` field (added automatically)
4. Role-based access requires `role` field in users table (added automatically)

---

**Need Help?** Check the main README.md or contact the team.
