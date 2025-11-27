import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Local OLAP database connection
const olapPool = new Pool({
  host: process.env.DB_LOCAL_HOST || "postgres",
  port: process.env.DB_LOCAL_PORT || 5432,
  database: process.env.DB_LOCAL_DATABASE || "kpop_store",
  user: process.env.DB_LOCAL_USER || "postgres",
  password: process.env.DB_LOCAL_PASSWORD || "postgres",
});

console.log("OLAP Auto-Refresh Service started");
console.log("Refresh interval: 5 minutes");

// Function to refresh all OLAP reports
async function refreshOLAPReports() {
  try {
    console.log(`[${new Date().toISOString()}] Starting OLAP refresh...`);

    const client = await olapPool.connect();

    try {
      // Call the refresh function that updates all report tables
      await client.query("SELECT refresh_all_reports()");

      console.log(
        `[${new Date().toISOString()}] OLAP reports refreshed successfully`
      );

      // Log data freshness (only if view exists)
      try {
        const freshnessResult = await client.query(
          "SELECT * FROM olap_data_freshness"
        );
        console.log("Data freshness:");
        freshnessResult.rows.forEach((row) => {
          console.log(
            `  ${row.table_name}: ${row.row_count} rows, last updated ${
              row.age || "just now"
            }`
          );
        });
      } catch (err) {
        // olap_data_freshness view might not exist yet
        console.log("  (Data freshness view not available)");
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error refreshing OLAP reports:`,
      error.message
    );
  }
}

// Initial refresh on startup (after 3 seconds to allow database to be ready)
setTimeout(() => {
  console.log("Running initial refresh...");
  refreshOLAPReports();
}, 3000);

// Schedule periodic refresh every 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

setInterval(() => {
  refreshOLAPReports();
}, REFRESH_INTERVAL);

console.log(`Scheduled refresh every ${REFRESH_INTERVAL / 1000 / 60} minutes`);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down OLAP replicator...");
  await olapPool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down OLAP replicator...");
  await olapPool.end();
  process.exit(0);
});
