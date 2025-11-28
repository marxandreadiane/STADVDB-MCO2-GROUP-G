# KPop Store - E-Commerce System

Full-stack K-Pop album store with authentication, shopping cart, order management, admin dashboard, and OLAP analytics. Built with React, Node.js, Express, and PostgreSQL (Supabase).

Link to recorded DEMO:

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)

## Features

**Customer Features**
- Browse and search K-Pop albums with filtering (artist, company, price) and sorting
- Shopping cart with real-time stock validation and database persistence
- User authentication with role-based access (customer/admin)
- Order checkout with payment methods and order history tracking
- Guest browsing enabled (authentication required for cart)

**Admin Features**
- Dashboard with 5 tabs: Orders, Albums, Artists, Companies, Users
- Full CRUD operations for all entities
- Order status management (PENDING → PAID → SHIPPED → DELIVERED → CANCELLED)
- Automatic stock management on order status changes
- Advanced deletion controls with dependency checking and force cascade options

**Analytics & Reports**
- OLAP operations: Roll-up, drill-down, slice, and dice
- Sales analytics by company, artist, and album
- Time series trends with multiple granularities
- Auto-refresh every 5 minutes with manual refresh option
- Role-based views (admins see revenue, customers see popularity trends)

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Supabase account (free tier)
- Git

### Installation

1. **Clone and configure**
   ```bash
   git clone https://github.com/marxandreadiane/STADVDB-MCO2-GROUP-G.git
   cd STADVDB-MCO2-GROUP-G
   cp .env.example .env
   ```

2. **Update .env with your Supabase credentials**
   ```env
   DB_MAIN_HOST=your-project.supabase.co
   DB_MAIN_PORT=6543
   DB_MAIN_USER=postgres.your-project-id
   DB_MAIN_PASS=your-password
   DB_MAIN_NAME=postgres
   DB_SSL=true
   ```

3. **Initialize database**
   - Open Supabase SQL Editor: https://supabase.com/dashboard
   - Run `database/FINAL-COMPLETE-SETUP.sql`

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Access application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Credentials
- **Admin:** admin@kpopstore.com / admin123
- **Customer:** fan123@email.com / password123


## Database Schema

**Core Tables**
- `companies` - Entertainment agencies (SM, JYP, YG)
- `artists` - K-Pop artists/groups
- `albums` - Album catalog with stock tracking
- `users` - User accounts with roles (customer/admin)
- `orders` - Purchase orders with status tracking
- `order_items` - Order line items
- `payments` - Payment transactions
- `cart_items` - Shopping cart persistence

**Order Status Flow**
```
PENDING → PAID → SHIPPED → DELIVERED
   ↓
CANCELLED
```

**Stock Management**
- Stock decrements when order status changes to PAID or SHIPPED
- Stock restores when order is CANCELLED from PAID/SHIPPED state
- Cart validation prevents overselling


## API Endpoints

**Base URL:** `http://localhost:5000`

### Authentication
```http
POST /api/auth/signup      # Register new user
POST /api/auth/login       # User login
```

### Albums
```http
GET /api/albums            # Get all albums
```

### Cart
```http
GET    /api/cart/:userId                 # Get user cart
POST   /api/cart                         # Add to cart
PUT    /api/cart/:userId/:albumId        # Update quantity
DELETE /api/cart/:userId/:albumId        # Remove item
DELETE /api/cart/:userId                 # Clear cart
```

### Orders
```http
POST /api/orders               # Create order
GET  /api/orders/user/:userId  # Get user orders
```

### Admin
```http
GET /api/admin/orders                        # All orders
PUT /api/admin/orders/:id/status             # Update order status

# CRUD for albums, artists, companies, users
GET    /api/admin/:entity
POST   /api/admin/:entity
PUT    /api/admin/:entity/:id
DELETE /api/admin/:entity/:id
DELETE /api/admin/:entity/:id?force=true     # Force delete with dependencies
```

### Reports (OLAP)
```http
GET /api/reports/rollup-sales?level=company|artist|album
GET /api/reports/drilldown/:type/:id
GET /api/reports/slice/:dimension?value=optional
GET /api/reports/dice?startDate=&endDate=&status=&minPrice=&maxPrice=
GET /api/reports/sales-trends?granularity=daily|monthly|quarterly|annual
GET /api/reports/dimensions
```


## Technology Stack

**Frontend:** React 18.3.1, Recharts 2.15.0, Context API  
**Backend:** Node.js 18, Express 5.1.0, pg 8.13.1  
**Database:** PostgreSQL 15 (Supabase cloud)  
**Infrastructure:** Docker, Docker Compose  