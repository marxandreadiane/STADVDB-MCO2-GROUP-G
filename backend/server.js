// server.js
import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Create DB connections (PostgreSQL)
const mainDB = new Pool({
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT || 5432,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASS,
  database: process.env.DB_MAIN_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const reportsDB = new Pool({
  host: process.env.DB_REPORTS_HOST,
  port: process.env.DB_REPORTS_PORT || 5432,
  user: process.env.DB_REPORTS_USER,
  password: process.env.DB_REPORTS_PASS,
  database: process.env.DB_REPORTS_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ✅ Root check
app.get("/", (req, res) => {
  res.send("KPop Store API is running 🚀");
});

// 💿 Get all albums (transactional DB)
app.get("/api/albums", async (req, res) => {
  try {
    const result = await mainDB.query(`
      SELECT 
        albums.album_id,
        albums.title as album_name,
        artists.name as artist_name,
        companies.name as company_name,
        albums.price
      FROM albums
      JOIN artists ON albums.artist_id = artists.artist_id
      JOIN companies ON artists.company_id = companies.company_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

// 🛒 Create new order
app.post("/api/orders", async (req, res) => {
  const { customer_id, album_id, quantity } = req.body;

  try {
    await mainDB.query(
      "INSERT INTO orders (customer_id, album_id, quantity, order_date) VALUES (?, ?, ?, NOW())",
      [customer_id, album_id, quantity]
    );
    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 📊 Sales Report (analytics DB)
app.get("/api/reports/sales", async (req, res) => {
  try {
    const result = await reportsDB.query(`
      SELECT company_name, SUM(total_sales) AS total_sales
      FROM company_sales_report
      GROUP BY company_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// 🎧 Album popularity report (analytics DB)
app.get("/api/reports/top-albums", async (req, res) => {
  try {
    const result = await reportsDB.query(`
      SELECT album_name, SUM(sales_count) AS total_sales
      FROM album_sales_report
      GROUP BY album_name
      ORDER BY total_sales DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top albums" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
