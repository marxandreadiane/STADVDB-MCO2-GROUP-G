# KPop Store - Database Management System

A full-stack web application for managing a K-Pop album store with cloud PostgreSQL database via Supabase.

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (optional, for cloning)

### Running the Application

1. **Clone or navigate to the project directory:**
   ```bash
   cd STADVDB-MCO2-GROUP-G
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

## 📁 Project Structure

```
STADVDB-MCO2-GROUP-G/
├── backend/                 # Node.js Express API
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   ├── Dockerfile          # Backend container config
│   └── .dockerignore
├── frontend/               # React application
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── ...
│   ├── public/
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Frontend container config
│   └── .dockerignore
├── database/               # Database schemas and scripts
│   ├── supabase-init.sql  # Main database schema & seed data
│   ├── supabase-reports.sql # Reporting views
│   └── README.md          # Database setup instructions
├── docker-compose.yml     # Docker orchestration config
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
└── README.md             # This file
```

## 🛠️ Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** PostgreSQL via Supabase (cloud-hosted)
- **Containerization:** Docker & Docker Compose

## 🗄️ Database Architecture

### Supabase PostgreSQL Database
Cloud-hosted PostgreSQL database handling:
- **Transactional Tables:**
  - Companies (K-Pop entertainment agencies)
  - Artists
  - Albums
  - Users
  - Orders
  - Order Items
  - Payments

- **Reporting Views:**
  - Company sales reports
  - Album sales reports
  - Monthly sales analytics
  - Top customers
  - Payment method statistics

## 🔑 Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

The `.env` file contains configuration for Supabase PostgreSQL connection:

```env
PORT=5000

# Main Database Connection (Supabase)
DB_MAIN_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_MAIN_PORT=6543
DB_MAIN_USER=postgres.ucrvnxomoogsbcpbnldi
DB_MAIN_PASS=kpop-db-pass
DB_MAIN_NAME=postgres
DB_SSL=true

# Reports Database Connection (same Supabase instance)
DB_REPORTS_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_REPORTS_PORT=6543
DB_REPORTS_USER=postgres.ucrvnxomoogsbcpbnldi
DB_REPORTS_PASS=kpop-db-pass
DB_REPORTS_NAME=postgres
DB_SSL=true
```

**Note:** The entire team shares the same Supabase database for load testing. Just copy `.env.example` to `.env` and you're ready to go!

## 📡 API Endpoints

### Albums
- `GET /api/albums` - Get all albums with artist and company details

### Orders
- `POST /api/orders` - Create a new order

### Reporting Views
- `GET /api/reports/sales` - Get sales by company (from `company_sales_report` view)
- `GET /api/reports/top-albums` - Get top albums by sales (from `album_sales_report` view)

## 🔄 Development Workflow

### First Time Setup
```bash
# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d
```

### Daily Development
```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Database Management
The database is hosted on Supabase and shared across the team:
- To view/edit data: Log into [Supabase Dashboard](https://supabase.com)
- Database scripts are in the `database/` folder
- See `database/README.md` for setup instructions

## 🐛 Troubleshooting

### Missing .env File
Make sure you copied `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Frontend Not Loading
Wait 30-60 seconds for the React app to compile on first start.

### Backend Can't Connect to Database
- Check that `.env` file exists and contains Supabase credentials
- Verify SSL is enabled (`DB_SSL=true`)
- Ensure you have internet connection (database is cloud-hosted)

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Database Connection Issues
If you see connection errors:
1. Check Supabase project is active at https://supabase.com
2. Verify credentials in `.env` match Supabase settings
3. Ensure port 6543 is accessible (connection pooling port)

## 📊 Sample Data

The Supabase database comes pre-loaded with:
- 3 K-Pop entertainment companies (SM Entertainment, JYP Entertainment, YG Entertainment)
- 5 artists (EXO, Red Velvet, TWICE, Stray Kids, BLACKPINK)
- 10 albums from various artists
- Sample users, orders, and payments
- 5 analytical reporting views

## 🤝 Team Setup

For teammates joining the project:

1. **Clone the repository**
2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```
3. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```
4. **Access the app at http://localhost:3000**

That's it! The shared Supabase database is already set up and ready to use.

## 📝 Notes

- Frontend runs in development mode (not optimized for production)
- Database is cloud-hosted on Supabase (shared across team)
- Hot reload is enabled for both frontend and backend during development
- CORS is enabled for local development
- SSL/TLS required for Supabase connections

## 👥 Team

STADVDB MCO2 - Group G

---

**Need help?** Check the logs with `docker-compose logs -f` to see what's happening in real-time.
