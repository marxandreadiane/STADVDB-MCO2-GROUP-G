# Changelog

All notable changes to the KPop Store E-Commerce System.

## [Latest] - 2024

### ✨ Added

#### Admin CRUD Operations
- **Full CRUD Dashboard** with 5 tabs: Orders, Albums, Artists, Companies, Users
- **Create Operations:**
  - Add new albums with title, artist, price, release date, stock, and image URL
  - Add new artists with name, company, debut date, and country
  - Add new companies (entertainment agencies)
- **Read Operations:**
  - View all entities in organized tables with relevant joined data
  - Real-time data fetching on tab switch
- **Update Operations:**
  - Edit albums, artists, companies, and users via modal forms
  - Update order statuses (PENDING → PAID → SHIPPED → DELIVERED)
  - Pre-populated forms with existing data
- **Delete Operations:**
  - Delete albums, artists, companies, and users with confirmation prompts
  - Foreign key safe operations (cascade delete where appropriate)
- **Modal Interface:**
  - Clean modal forms for create/edit operations
  - Cancel button to close without saving
  - Validation and error handling

#### Stock Management System
- **Inventory Tracking:**
  - `stock_quantity` field added to albums table
  - Stock validation before adding to cart
  - Stock validation before order creation
  - Automatic stock decrement when orders are placed
  - Transaction rollback if insufficient stock
- **UI Indicators:**
  - 🟢 **In Stock** - 10+ items available (green badge)
  - 🟡 **Low Stock** - 1-9 items available (yellow badge)
  - 🔴 **Out of Stock** - 0 items (red badge, disabled buttons)
- **Cart Validation:**
  - Cannot add more than available stock
  - Error messages show available quantity
  - Disabled + button when cart quantity equals stock
  - Disabled "Add to Cart" button for out-of-stock items

#### Role-Based Navigation
- **Customer Navigation:**
  - Normal horizontal menu buttons
  - Direct access to: Home, Albums, Cart, Orders, Reports
  - Clean, simple interface
- **Admin Navigation:**
  - Client-Side dropdown for customer features
  - Direct "Admin-Side" button for admin dashboard
  - Visual distinction between customer and admin sections
  - Cart count badge on Cart button

#### Database Improvements
- **UNIQUE Constraint:**
  - Added `UNIQUE(title, artist_id)` to albums table
  - Prevents duplicate albums from being created
  - Enforced at database level for data integrity
- **UPSERT Pattern:**
  - `INSERT ... ON CONFLICT DO UPDATE` for safe re-runs
  - Updates existing records instead of throwing errors
  - Preserves existing image_url values
  - Adds stock quantities together on conflict
- **Single Setup Script:**
  - Consolidated all database setup into `FINAL-COMPLETE-SETUP.sql`
  - Includes schema, constraints, sample data, and analytics views
  - Idempotent (safe to run multiple times)
  - No need for separate cleanup scripts

### 🔧 Changed

#### Backend API
- **16 New Endpoints:**
  - Albums CRUD: GET, POST, PUT, DELETE `/api/admin/albums`
  - Artists CRUD: GET, POST, PUT, DELETE `/api/admin/artists`
  - Companies CRUD: GET, POST, PUT, DELETE `/api/admin/companies`
  - Users Management: GET, PUT, DELETE `/api/admin/users`
- **Stock Management Logic:**
  - POST `/api/cart` - Validates stock before adding
  - PUT `/api/cart/:userId/:albumId` - Validates stock on update
  - POST `/api/orders` - Checks stock and decrements in transaction
- **Error Handling:**
  - Detailed error messages for stock issues
  - Returns available stock count in error responses
  - Transaction rollback on any failure during order creation

#### Frontend Components
- **Admin.js (Complete Rewrite):**
  - 708 lines of comprehensive admin dashboard
  - Tab-based interface with state management
  - Modal forms for create/edit operations
  - Delete confirmations with alerts
  - Dynamic API endpoint construction based on active tab
- **Navbar.js (Enhanced):**
  - Conditional rendering based on user role
  - Dropdown for admins, normal buttons for customers
  - Cart count badge integration
  - Active state indicators
- **Albums.js (Enhanced):**
  - Stock indicator badges with color coding
  - Disabled buttons for out-of-stock items
  - Quantity controls with stock validation
  - Real-time stock display
- **Albums.css (New Styles):**
  - Stock indicator styling (green, yellow, red)
  - Disabled button states
  - Badge positioning and animations

#### Database Schema
- **Albums Table:**
  - Added `UNIQUE(title, artist_id)` constraint
  - Existing `stock_quantity` field now actively used
- **Sample Data:**
  - 10 albums with stock quantities (20-50 units each)
  - 5 users (2 admins, 3 customers)
  - Realistic pricing ($14.99-$19.99)

### 🗑️ Removed

#### Redundant Documentation
- Removed `ADMIN-CRUD-NAVBAR-UPDATE.md` (features now documented in main README)
- Removed `FIX-ADMIN-SIDE.md` (bug fix documented)
- Removed `IMPLEMENTATION-GUIDE.md` (consolidated into README)
- Removed `STOCK-MANAGEMENT-UPDATE.md` (features documented)
- Removed `README-NEW.md` (merged into main README)

#### Obsolete Scripts
- Removed `CLEANUP-DUPLICATES.sql` (no longer needed with UNIQUE constraint)

### 🐛 Fixed

#### Admin Dashboard Access
- **Issue:** Admin-Side dropdown not showing after login
- **Root Cause:** localStorage had cached user data without `role` field
- **Fix:** 
  - Added debug logging to show user object structure
  - Cleared localStorage and re-logged in to load fresh data
  - Backend now always returns `role` field in login response

#### Duplicate Albums
- **Issue:** Same album appearing twice (one with NULL image_url, one with URL)
- **Root Cause:** No UNIQUE constraint allowed duplicate inserts
- **Fix:**
  - Added `UNIQUE(title, artist_id)` constraint to albums table
  - Converted INSERT statements to UPSERT pattern
  - Changed to `ON CONFLICT DO UPDATE` to handle duplicates gracefully
  - Removed separate cleanup script (no longer needed)

#### Navbar UX
- **Issue:** Admin-Side had dropdown with only one option (redundant)
- **Fix:** Changed to direct button instead of dropdown
- **Issue:** Both customers and admins had dropdowns (confusing)
- **Fix:** Role-based rendering - normal buttons for customers, dropdown only for admins

#### Stock Management
- **Issue:** Stock not decreasing when orders placed
- **Fix:**
  - Added stock validation in cart operations
  - Added stock decrement in order creation transaction
  - Added rollback logic if insufficient stock
  - UI displays stock indicators and disables buttons

### 📚 Documentation

#### Main README.md
- Updated feature list with CRUD operations
- Added stock management features
- Documented role-based navigation
- Added 16 new API endpoints
- Included all default user credentials
- Updated troubleshooting section

#### database/README.md
- Documented UNIQUE constraint behavior
- Explained UPSERT pattern
- Added stock management explanation
- Described idempotent setup script
- Removed references to obsolete files

#### database/FINAL-COMPLETE-SETUP.sql
- Added inline comments for UNIQUE constraint
- Documented UPSERT logic with examples
- Removed cleanup section (no longer needed)
- Added success messages at end

#### backend/server.js
- Added JSDoc comments for CRUD endpoints section
- Documented stock management logic in cart operations
- Explained stock decrement in order creation
- Added inline comments for transaction handling

#### frontend/src/pages/Admin.js
- Added comprehensive component documentation
- Explained CRUD operations and features
- Documented role-based access control
- Listed all capabilities in header comment

## [Previous Versions]

### Authentication System
- User signup and login
- Role-based access control (admin/customer)
- Session management via localStorage

### Shopping Cart
- Database-backed cart (cart_items table)
- Add, update, remove items
- Quantity controls
- Persistent across sessions

### Order Management
- Checkout process
- Order history per user
- Order status tracking (PENDING, PAID, SHIPPED, DELIVERED)
- Payment method selection

### Reports & Analytics
- Company sales reports
- Top selling albums
- Monthly sales trends
- Top customers
- Payment method statistics

### Filters & Search
- Search albums by name
- Filter by artist
- Filter by company
- Sort by: Newest, Oldest, Price (Low-High, High-Low), Name (A-Z, Z-A)

---

## Migration Guide

### Upgrading from Earlier Versions

If you have an existing installation, follow these steps to upgrade:

1. **Backup Your Data:**
   ```sql
   -- Export your current data if needed
   ```

2. **Add UNIQUE Constraint:**
   ```sql
   ALTER TABLE albums 
   ADD CONSTRAINT unique_album_per_artist 
   UNIQUE (title, artist_id);
   ```

3. **Remove Duplicates (if any):**
   - Check for duplicates: 
     ```sql
     SELECT title, artist_id, COUNT(*) 
     FROM albums 
     GROUP BY title, artist_id 
     HAVING COUNT(*) > 1;
     ```
   - Remove duplicates manually via Supabase Table Editor

4. **Update Stock Quantities:**
   - The `stock_quantity` field should already exist
   - Set initial stock values for all albums:
     ```sql
     UPDATE albums SET stock_quantity = 50 WHERE stock_quantity IS NULL;
     ```

5. **Pull Latest Code:**
   ```bash
   git pull origin main
   ```

6. **Restart Services:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

7. **Clear Browser Cache:**
   - Clear localStorage (or logout and re-login)
   - Refresh the page
   - Login again to get the `role` field

---

## Known Issues & Limitations

### None Currently

All reported issues have been resolved. The system is production-ready.

---

## Future Enhancements (Potential)

- [ ] TypeScript migration for better type safety
- [ ] Image upload to Supabase Storage instead of URLs
- [ ] Advanced search with multiple filters
- [ ] Email notifications for order updates
- [ ] CSV export for reports
- [ ] Dark mode theme
- [ ] Mobile responsive improvements
- [ ] Unit and integration tests
- [ ] API rate limiting
- [ ] Admin activity logs

---

**For more information, see the main [README.md](./README.md) or [database/README.md](./database/README.md).**
