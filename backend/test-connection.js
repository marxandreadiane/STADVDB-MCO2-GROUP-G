import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASS,
  database: process.env.DB_MAIN_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log("Testing connection to Supabase...");
    console.log("Host:", process.env.DB_MAIN_HOST);
    console.log("Database:", process.env.DB_MAIN_NAME);
    console.log("User:", process.env.DB_MAIN_USER);

    const dbInfo = await pool.query(
      "SELECT current_database(), current_schema()"
    );
    console.log("\nConnected to database:", dbInfo.rows[0]);

    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log("\nTables in public schema:");
    tablesResult.rows.forEach((row) => console.log("  -", row.tablename));

    const usersCheck = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'users'
    `);

    console.log(
      "\nUsers table exists:",
      usersCheck.rows.length > 0 ? "YES" : "NO"
    );

    if (usersCheck.rows.length > 0) {
      const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
      console.log("   Users in table:", userCount.rows[0].count);

      const sampleUsers = await pool.query(
        "SELECT email, role FROM users LIMIT 5"
      );
      console.log("   Sample users:");
      sampleUsers.rows.forEach((u) =>
        console.log("     -", u.email, `(${u.role})`)
      );
    }
  } catch (error) {
    console.error("\nConnection error:", error.message);
    console.error("Error code:", error.code);
  } finally {
    await pool.end();
  }
}

testConnection();
