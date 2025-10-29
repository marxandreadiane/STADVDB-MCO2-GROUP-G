# 🎵 KPop Store - E-Commerce System

A full-stack web application for managing a K-Pop album store with authentication, shopping cart, order management, and admin dashboard. Built with React, Node.js, and cloud PostgreSQL via Supabase.

## ✨ Features

### 🛍️ **Customer Features**
- **Browse Albums** - View K-Pop albums with search and filters (artist, company, sort by price/date/name)
- **Stock Indicators** - Real-time stock status (In Stock 🟢 / Low Stock 🟡 / Out of Stock 🔴)
- **Shopping Cart** - Add albums to cart with quantity controls (stored in database)
  - Stock validation prevents adding more than available quantity
  - Disabled buttons for out-of-stock items
- **User Authentication** - Sign up and login system
- **Order History** - View past orders with status tracking
- **Checkout** - Complete purchase with payment methods
- **Guest Browsing** - Browse albums without login (authentication required for cart)
- **Inventory Management** - Stock decrements automatically when orders are placed

### 🛡️ **Admin Features**
- **Admin Dashboard** - Comprehensive management interface with 5 tabs
- **Full CRUD Operations:**
  - **Orders:** View all orders, update statuses (PENDING → PAID → SHIPPED → DELIVERED)
  - **Albums:** Create, edit, delete albums with stock management
  - **Artists:** Manage K-Pop artists and groups
  - **Companies:** Manage entertainment agencies
  - **Users:** View and manage user accounts with role badges
- **Statistics** - Real-time order count by status
- **Filter Orders** - Filter by status (All, Pending, Paid, Shipped, Delivered)
- **Role-Based UI** - Admins see dropdown navigation + Admin-Side button
- **User Roles** - Role-based access control (admin/customer)

### 📊 **Reports & Analytics**
- Company sales reports
- Album popularity rankings
- Monthly sales analytics
- Top customers
- Payment method statistics

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (for cloning the repository)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/marxandreadiane/STADVDB-MCO2-GROUP-G.git
   cd STADVDB-MCO2-GROUP-G
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Run the database setup:**
   - Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
   - Copy contents of `database/FINAL-COMPLETE-SETUP.sql`
   - Paste and run in Supabase

4. **Start all services:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   - 🌐 **Frontend:** http://localhost:3000
   - 🔧 **Backend API:** http://localhost:5000

6. **Login credentials:**
   - **Admin:** admin@kpopstore.com / admin123
   - **Customer:** fan123@email.com / password123

---

## 📁 Project Structure

```
STADVDB-MCO2-GROUP-G/
├── backend/                    # Node.js Express API
│   ├── server.js              # Main server with all API endpoints
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend container config
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.js      # Navigation with cart count
│   │   │   └── AuthModal.js   # Login/Signup modal
│   │   ├── context/           # React Context for state
│   │   │   ├── AuthContext.js # Authentication state
│   │   │   └── CartContext.js # Shopping cart state
│   │   ├── pages/             # Main page components
│   │   │   ├── Home.js        # Landing page
│   │   │   ├── Albums.js      # Product catalog with filters
│   │   │   ├── Cart.js        # Shopping cart page
│   │   │   ├── Orders.js      # Order history page
│   │   │   ├── Admin.js       # Admin dashboard
│   │   │   ├── Checkout.js    # Checkout form
│   │   │   ├── Reports.js     # Analytics reports
│   │   │   └── OrderSuccess.js # Order confirmation
│   │   ├── App.js             # Main app component
│   │   └── index.js           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── Dockerfile             # Frontend container config
│
├── database/                   # Database setup
│   ├── FINAL-COMPLETE-SETUP.sql  # Complete database setup (USE THIS!)
│   └── README.md              # Database documentation
│
├── docker-compose.yml         # Docker orchestration
├── .env.example               # Environment template
└── README.md                  # This file
```

---

## 🗄️ Database Schema

### Core Tables
- **`companies`** - K-Pop entertainment agencies (SM, JYP, YG, etc.)
- **`artists`** - K-Pop artists and groups
- **`albums`** - Album catalog with prices and stock
- **`users`** - User accounts with roles (customer/admin)
- **`orders`** - Customer orders with statuses
- **`order_items`** - Items within each order
- **`payments`** - Payment transactions
- **`cart_items`** - User shopping carts (database-backed)

### Order Status Flow
```
PENDING → PAID → SHIPPED → DELIVERED
           ↓
       CANCELLED
```

### User Roles
- **`customer`** - Regular users (default)
- **`admin`** - Full admin access to dashboard

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### Albums
- `GET /api/albums` - Get all albums with artist/company details

### Cart
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:userId/:albumId` - Update cart item quantity
- `DELETE /api/cart/:userId/:albumId` - Remove item from cart
- `DELETE /api/cart/:userId` - Clear entire cart

### Orders
- `POST /api/orders` - Create new order (includes checkout)
- `GET /api/orders/user/:userId` - Get user's order history

### Admin
- `GET /api/admin/orders` - Get all orders (admin only)
- `PUT /api/admin/orders/:orderId/status` - Update order status
- **Albums CRUD:**
  - `GET /api/admin/albums` - Get all albums
  - `POST /api/admin/albums` - Create new album
  - `PUT /api/admin/albums/:id` - Update album
  - `DELETE /api/admin/albums/:id` - Delete album
- **Artists CRUD:**
  - `GET /api/admin/artists` - Get all artists
  - `POST /api/admin/artists` - Create new artist
  - `PUT /api/admin/artists/:id` - Update artist
  - `DELETE /api/admin/artists/:id` - Delete artist
- **Companies CRUD:**
  - `GET /api/admin/companies` - Get all companies
  - `POST /api/admin/companies` - Create new company
  - `PUT /api/admin/companies/:id` - Update company
  - `DELETE /api/admin/companies/:id` - Delete company
- **Users Management:**
  - `GET /api/admin/users` - Get all users
  - `PUT /api/admin/users/:id` - Update user
  - `DELETE /api/admin/users/:id` - Delete user

### Reports
- `GET /api/reports/sales` - Company sales report
- `GET /api/reports/top-albums` - Top selling albums

---

## 🛠️ Technology Stack

- **Frontend:** React 18, CSS3
- **Backend:** Node.js 18, Express 5.1.0
- **Database:** PostgreSQL (Supabase cloud-hosted)
- **Containerization:** Docker & Docker Compose
- **State Management:** React Context API
- **Authentication:** Role-based (plain text for development)

---

## 🔐 Default Users

### Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@kpopstore.com | admin123 | admin |
| superadmin@kpopstore.com | super123 | admin |

### Customer Accounts
| Email | Password | Role |
|-------|----------|------|
| fan123@email.com | password123 | customer |
| music@email.com | password123 | customer |
| collector@email.com | password123 | customer |

---

## 🔄 Development Workflow

### Start Development
```bash
docker-compose up -d
```

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

### Rebuild Containers
```bash
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Frontend Not Loading
- Wait 30-60 seconds for React to compile on first start
- Check logs: `docker-compose logs frontend`

### Backend Connection Errors
- Verify `.env` file exists (copy from `.env.example`)
- Check Supabase credentials are correct
- Ensure `DB_SSL=true` is set

### Database Connection Issues
1. Verify Supabase project is active at https://supabase.com
2. Check internet connection (database is cloud-hosted)
3. Confirm port 6543 is accessible

### Cart Not Updating
- Ensure database `cart_items` table exists
- Run `FINAL-COMPLETE-SETUP.sql` if needed
- Check browser console for errors

### Admin Dashboard Not Accessible
- Login with admin account (admin@kpopstore.com)
- Regular users won't see "Admin" button in navbar
- Check user role: `SELECT role FROM users WHERE email = 'your@email.com'`

---

## 📊 Sample Data

The database includes:
- **3 Companies:** SM Entertainment, JYP Entertainment, YG Entertainment
- **5 Artists:** EXO, Red Velvet, TWICE, Stray Kids, BLACKPINK
- **10 Albums** with prices ranging from $14.99 to $19.99
- **5 Users** (3 customers + 2 admins)
- **Reporting Views** for analytics

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- ✅ Sign up new account
- ✅ Login with existing account
- ✅ Logout
- ✅ Guest browsing (no login required)

**Shopping Flow:**
- ✅ Browse albums
- ✅ Search albums
- ✅ Filter by artist/company
- ✅ Sort albums (newest, oldest, price, name)
- ✅ Add album to cart (requires login)
- ✅ Adjust quantity (+/-)
- ✅ View cart
- ✅ Checkout
- ✅ View order history

**Admin:**
- ✅ Login as admin
- ✅ View all orders
- ✅ Filter orders by status
- ✅ Update order status
- ✅ View statistics

### Load Testing
- Database-backed cart supports concurrent users
- Stateless authentication for JMeter compatibility
- Order status transitions for realistic testing scenarios

---

## 🤝 Team Collaboration

### For New Team Members:

1. Clone repo
2. Copy `.env.example` to `.env`
3. Run `docker-compose up -d`
4. Access http://localhost:3000

**Shared Supabase Database:** All team members use the same cloud database for consistent testing.

---

## 📝 Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000

# Supabase PostgreSQL (Main Database)
DB_MAIN_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_MAIN_PORT=6543
DB_MAIN_USER=postgres.ucrvnxomoogsbcpbnldi
DB_MAIN_PASS=kpop-db-pass
DB_MAIN_NAME=postgres
DB_SSL=true

# Supabase PostgreSQL (Reports Database - same instance)
DB_REPORTS_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_REPORTS_PORT=6543
DB_REPORTS_USER=postgres.ucrvnxomoogsbcpbnldi
DB_REPORTS_PASS=kpop-db-pass
DB_REPORTS_NAME=postgres
DB_SSL=true
```

---

## 📚 Additional Documentation

- **Database Setup:** See `database/README.md`
- **SQL Schema:** See `database/FINAL-COMPLETE-SETUP.sql`
- **Image Management:** See `database/IMAGE-MANAGEMENT-GUIDE.md`

---

## 👥 Team

**STADVDB MCO2 - Group G**

---

## 📄 License

This project is for educational purposes as part of STADVDB MCO2.

---

**Need Help?** Check logs with `docker-compose logs -f` or contact the team.

🎉 **Happy Shopping!** 🎉
