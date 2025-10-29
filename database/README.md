# Database Schema

This folder contains PostgreSQL schema and view definitions for the Supabase database.

## Files

### `supabase-init.sql`
Main database schema including:
- Companies (K-Pop entertainment agencies)
- Artists
- Albums
- Users
- Orders
- Order Items
- Payments
- Sample seed data

**Run this first** when setting up a new Supabase project.

### `supabase-reports.sql`
Analytics views and reports including:
- Company sales report
- Album sales report
- Monthly sales report
- Top customers report
- Payment method analytics

**Run this after** running `supabase-init.sql`.

## How to Use

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the content of `supabase-init.sql`
5. Click "Run"
6. Repeat with `supabase-reports.sql`

## Database Info

- **Type:** PostgreSQL
- **Platform:** Supabase
- **Connection details:** See `.env` file in root directory
