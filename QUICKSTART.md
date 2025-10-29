# 🚀 Quick Start Guide

**New to this project?** This guide will get you up and running in under 5 minutes.

## Prerequisites

You need these installed on your machine:
- ✅ [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- ✅ Git
- ✅ A text editor (VS Code recommended)
- ✅ A Supabase account (free tier is fine)

## Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/marxandreadiane/STADVDB-MCO2-GROUP-G.git
cd STADVDB-MCO2-GROUP-G
```

### 2️⃣ Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

The `.env` file is already configured with the team's shared Supabase credentials. **No changes needed!**

### 3️⃣ Initialize the Database

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Click "New Query"
3. Open `database/FINAL-COMPLETE-SETUP.sql` in your editor
4. Copy **all** the content (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor (Ctrl+V)
6. Click **"Run"** (or press F5)
7. Wait ~10 seconds for completion
8. ✅ You should see success messages at the bottom

> **Note:** This script is idempotent - safe to run multiple times without creating duplicates.

### 4️⃣ Start the Application

```bash
docker-compose up -d
```

This will:
- ✅ Download Docker images (first time only, ~5 minutes)
- ✅ Start the backend API on port 5000
- ✅ Start the frontend React app on port 3000
- ✅ Run everything in the background (`-d` flag)

### 5️⃣ Access the Application

Wait about 30-60 seconds for React to compile (first time only), then:

- 🌐 **Open your browser:** http://localhost:3000
- 🎉 **You're done!**

### 6️⃣ Login

Try these accounts:

**Admin Account** (full access):
- Email: `admin@kpopstore.com`
- Password: `admin123`

**Customer Account** (regular user):
- Email: `fan123@email.com`
- Password: `password123`

---

## What Can You Do?

### As a Customer 🛍️
1. Browse K-Pop albums
2. Search and filter albums
3. Add items to cart
4. Checkout and place orders
5. View order history
6. See real-time stock indicators

### As an Admin 🛡️
1. Everything customers can do, **PLUS:**
2. View all customer orders
3. Update order statuses
4. **CRUD Operations:**
   - Create, edit, delete albums
   - Create, edit, delete artists
   - Create, edit, delete companies
   - View and manage users

---

## Useful Commands

### View Logs
```bash
docker-compose logs -f          # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only
```

### Restart Services
```bash
docker-compose restart          # All services
docker-compose restart backend  # Backend only
```

### Stop Services
```bash
docker-compose down
```

### Rebuild (after code changes)
```bash
docker-compose down
docker-compose up -d --build
```

---

## Project Structure

```
STADVDB-MCO2-GROUP-G/
├── backend/              # Node.js Express API (Port 5000)
│   └── server.js        # Main API with 30+ endpoints
├── frontend/            # React application (Port 3000)
│   └── src/
│       ├── pages/       # Main pages (Home, Albums, Cart, Admin, etc.)
│       ├── components/  # Reusable components (Navbar, AuthModal)
│       └── context/     # State management (Auth, Cart)
├── database/            # Database setup scripts
│   ├── FINAL-COMPLETE-SETUP.sql  # ⭐ Main setup script
│   └── README.md        # Database documentation
├── docker-compose.yml   # Container orchestration
├── .env                 # Environment variables (DO NOT COMMIT)
├── README.md            # Main documentation
└── CHANGELOG.md         # Version history and features
```

---

## Common Issues & Solutions

### ❌ Frontend Not Loading
**Problem:** Browser shows "Loading..." forever

**Solution:**
1. Wait 60 seconds (React needs time to compile)
2. Check logs: `docker-compose logs frontend`
3. If errors, try: `docker-compose restart frontend`

### ❌ Backend Connection Error
**Problem:** API calls failing, network errors

**Solution:**
1. Verify `.env` file exists
2. Check Docker is running: `docker ps`
3. Restart backend: `docker-compose restart backend`

### ❌ Database Connection Failed
**Problem:** "Unable to connect to database"

**Solution:**
1. Check internet connection (database is cloud-hosted)
2. Verify Supabase project is active: https://supabase.com/dashboard
3. Confirm `.env` credentials match Supabase settings

### ❌ Admin Dashboard Not Showing
**Problem:** Logged in as admin but don't see "Admin-Side" button

**Solution:**
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page
4. Login again
5. The `role` field will now load correctly

### ❌ "Out of Stock" for Everything
**Problem:** All albums show as out of stock

**Solution:**
1. Re-run `FINAL-COMPLETE-SETUP.sql` in Supabase
2. This resets stock quantities to initial values
3. Or manually update via Admin dashboard

---

## Next Steps

1. ✅ **Explore the Code:**
   - Start with `backend/server.js` for API endpoints
   - Check `frontend/src/pages/Admin.js` for CRUD operations
   - Review `database/FINAL-COMPLETE-SETUP.sql` for schema

2. ✅ **Read Documentation:**
   - [Main README](./README.md) - Complete feature list
   - [Database README](./database/README.md) - Schema details
   - [CHANGELOG](./CHANGELOG.md) - Version history

3. ✅ **Test Features:**
   - Add items to cart
   - Place an order (watch stock decrement)
   - Login as admin and try CRUD operations
   - Update an order status

4. ✅ **Make Changes:**
   - Code changes auto-reload in Docker
   - Database changes need manual SQL run
   - Always test after changes!

---

## Getting Help

1. **Check the main README:** [README.md](./README.md)
2. **Review logs:** `docker-compose logs -f`
3. **Database docs:** [database/README.md](./database/README.md)
4. **Feature history:** [CHANGELOG.md](./CHANGELOG.md)
5. **Contact the team:** See README for team info

---

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit `backend/server.js`
   - Server auto-restarts with nodemon
   - No rebuild needed

2. **Frontend changes:**
   - Edit files in `frontend/src/`
   - React hot-reloads automatically
   - See changes in ~2 seconds

3. **Database changes:**
   - Edit `database/FINAL-COMPLETE-SETUP.sql`
   - Run in Supabase SQL Editor
   - Changes apply immediately

### Testing Changes

1. Check backend logs: `docker-compose logs backend`
2. Check frontend console: Browser F12 → Console
3. Test the feature manually in the UI
4. Verify database changes in Supabase Table Editor

### Committing Code

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

> **Important:** Never commit the `.env` file (it's in `.gitignore`)

---

## Tech Stack

- **Frontend:** React 18 + CSS3
- **Backend:** Node.js 18 + Express 5.1.0
- **Database:** PostgreSQL 15 (Supabase cloud)
- **Containers:** Docker + Docker Compose
- **State:** React Context API

---

## Features at a Glance

✅ User authentication (signup/login)  
✅ Role-based access control (admin/customer)  
✅ Shopping cart with database persistence  
✅ Stock management (real-time inventory tracking)  
✅ Order placement and history  
✅ Order status workflow (PENDING → PAID → SHIPPED → DELIVERED)  
✅ Full CRUD admin dashboard (Albums, Artists, Companies, Users)  
✅ Search and filtering (by artist, company, price, date)  
✅ Analytics reports (sales, top albums, customers)  
✅ Guest browsing (no login required to view albums)  
✅ Stock indicators (In Stock / Low Stock / Out of Stock)  
✅ Responsive design  

---

**Happy coding! 🎉**

If you encounter any issues not covered here, check the main [README.md](./README.md) or ask the team.
