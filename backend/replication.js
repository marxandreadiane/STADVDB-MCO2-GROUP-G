import { createClient } from "@supabase/supabase-js";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Supabase client (source)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Local PostgreSQL client (target)
const localDb = new Pool({
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "kpop_store",
});

// Configuration for data sync
const SYNC_CONFIG = {
  // Sync interval in milliseconds (default: 5 minutes)
  interval: process.env.SYNC_INTERVAL || 300000,

  // Tables to sync (in order of dependencies)
  tables: [
    "companies",
    "artists",
    "albums",
    "users",
    "orders",
    "order_items",
    "cart_items",
  ],

  // Custom filters per table (optional)
  filters: {
    // Example: Only sync orders from last 30 days
    // orders: { created_at: { gte: '2024-11-01' } },
    // Example: Only sync specific companies
    // companies: { name: { in: ['SM Entertainment', 'JYP Entertainment'] } },
    // Example: Only sync albums in stock
    // albums: { stock_quantity: { gt: 0 } },
  },

  // Columns to exclude per table (optional)
  exclude: {
    // Example: Don't sync user passwords
    // users: ['password'],
  },
};

// Wait for local database to be ready
async function waitForDatabase() {
  console.log("Waiting for PostgreSQL to be ready...");
  let retries = 30;

  while (retries > 0) {
    try {
      await localDb.query("SELECT 1");
      console.log("✅ PostgreSQL is ready!");
      return;
    } catch (error) {
      retries--;
      console.log(`⏳ Waiting for PostgreSQL... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("PostgreSQL failed to start");
}

// Sync data from Supabase to local PostgreSQL
async function syncTable(table) {
  try {
    // Build query with optional filters
    let query = supabase.from(table).select("*");

    // Apply filters if defined
    if (SYNC_CONFIG.filters[table]) {
      const filters = SYNC_CONFIG.filters[table];
      for (const [column, condition] of Object.entries(filters)) {
        if (condition.gte) query = query.gte(column, condition.gte);
        if (condition.lte) query = query.lte(column, condition.lte);
        if (condition.gt) query = query.gt(column, condition.gt);
        if (condition.lt) query = query.lt(column, condition.lt);
        if (condition.eq) query = query.eq(column, condition.eq);
        if (condition.in) query = query.in(column, condition.in);
      }
    }

    // Fetch data from Supabase
    const { data, error } = await query;

    if (error) {
      console.error(`❌ Error fetching from ${table}:`, error.message);
      return { success: false, count: 0 };
    }

    if (!data || data.length === 0) {
      console.log(`⚪ No data in ${table}`);
      return { success: true, count: 0 };
    }

    // Filter out excluded columns
    let processedData = data;
    if (SYNC_CONFIG.exclude[table]) {
      const excludeCols = SYNC_CONFIG.exclude[table];
      processedData = data.map((row) => {
        const newRow = { ...row };
        excludeCols.forEach((col) => delete newRow[col]);
        return newRow;
      });
    }

    // Clear local table
    await localDb.query(`DELETE FROM ${table}`);

    // Prepare bulk insert
    const columns = Object.keys(processedData[0]);
    const columnNames = columns.join(", ");

    // Build values for all rows
    const values = [];
    const placeholders = processedData
      .map((row, rowIndex) => {
        const rowPlaceholders = columns.map((col, colIndex) => {
          const index = rowIndex * columns.length + colIndex;
          values.push(row[col]);
          return `$${index + 1}`;
        });
        return `(${rowPlaceholders.join(", ")})`;
      })
      .join(", ");

    // Get primary key for conflict handling
    const primaryKey = getPrimaryKey(table);

    // Insert into local database
    await localDb.query(
      `INSERT INTO ${table} (${columnNames}) VALUES ${placeholders} 
       ON CONFLICT (${primaryKey}) DO UPDATE 
       SET ${columns
         .filter((c) => c !== primaryKey)
         .map((c) => `${c} = EXCLUDED.${c}`)
         .join(", ")}`,
      values
    );

    return { success: true, count: data.length };
  } catch (error) {
    console.error(`❌ Error syncing ${table}:`, error.message);
    return { success: false, count: 0 };
  }
}

// Get primary key for a table
function getPrimaryKey(table) {
  const keyMap = {
    companies: "company_id",
    artists: "artist_id",
    albums: "album_id",
    users: "user_id",
    orders: "order_id",
    order_items: "order_item_id",
    cart_items: "cart_item_id",
    payments: "payment_id",
  };
  return keyMap[table] || "id";
}

// Perform full sync of all tables
async function performFullSync() {
  console.log("\n🔄 Starting data sync...\n");
  const startTime = Date.now();

  let totalRecords = 0;
  let successCount = 0;

  for (const table of SYNC_CONFIG.tables) {
    const result = await syncTable(table);
    if (result.success) {
      successCount++;
      totalRecords += result.count;
      if (result.count > 0) {
        console.log(`✅ Synced ${result.count} rows from ${table}`);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `\n✅ Sync complete! ${successCount}/${SYNC_CONFIG.tables.length} tables synced (${totalRecords} total records) in ${duration}s\n`
  );
}

// Schedule periodic syncs
function startPeriodicSync() {
  const intervalMinutes = Math.round(SYNC_CONFIG.interval / 60000);
  console.log(`⏰ Scheduled sync every ${intervalMinutes} minutes\n`);
  console.log("🎯 Sync service is running and monitoring...\n");

  setInterval(async () => {
    console.log(
      `\n⏰ [${new Date().toLocaleString()}] Starting scheduled sync...`
    );
    await performFullSync();
  }, SYNC_CONFIG.interval);
}

// Start sync service
async function startSyncService() {
  try {
    console.log("\n🚀 Starting Supabase to PostgreSQL Sync Service...\n");
    console.log("📋 Configuration:");
    console.log(
      `   - Sync interval: ${Math.round(SYNC_CONFIG.interval / 60000)} minutes`
    );
    console.log(`   - Tables: ${SYNC_CONFIG.tables.join(", ")}`);
    if (Object.keys(SYNC_CONFIG.filters).length > 0) {
      console.log(
        `   - Filters applied: ${Object.keys(SYNC_CONFIG.filters).join(", ")}`
      );
    }
    console.log("");

    await waitForDatabase();
    await performFullSync();
    startPeriodicSync();
  } catch (error) {
    console.error("❌ Sync service failed:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n⚠️ Received SIGTERM, shutting down gracefully...");
  await localDb.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n⚠️ Received SIGINT, shutting down gracefully...");
  await localDb.end();
  process.exit(0);
});

startSyncService();
