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

// 🔐 Authentication endpoints

// Sign up endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, phone, address } = req.body;

  try {
    // Check if user already exists
    const existingUser = await mainDB.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user with password (default role: customer)
    const result = await mainDB.query(
      'INSERT INTO users (username, email, password, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, email, phone, address, role',
      [username, email, password, phone || '', address || '', 'customer']
    );

    const user = result.rows[0];
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await mainDB.query(
      'SELECT user_id, username, email, phone, address, role FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role || 'customer'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Login failed" });
  }
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
        albums.price,
        albums.stock_quantity,
        albums.image_url
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

// 📦 ORDERS ENDPOINTS

// Get all orders (Admin)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const ordersResult = await mainDB.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.phone,
        u.username,
        u.email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.order_date DESC
    `);

    res.json(ordersResult.rows);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status (Admin)
app.put("/api/admin/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await mainDB.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated", order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get user's order history
app.get("/api/orders/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get orders
    const ordersResult = await mainDB.query(`
      SELECT 
        o.order_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.phone
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC
    `, [userId]);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await mainDB.query(`
          SELECT 
            oi.quantity,
            oi.price,
            al.title as album_name,
            ar.name as artist_name
          FROM order_items oi
          JOIN albums al ON oi.album_id = al.album_id
          JOIN artists ar ON al.artist_id = ar.artist_id
          WHERE oi.order_id = $1
        `, [order.order_id]);

        // Get payment info
        const paymentResult = await mainDB.query(`
          SELECT method, status
          FROM payments
          WHERE order_id = $1
          LIMIT 1
        `, [order.order_id]);

        return {
          ...order,
          items: itemsResult.rows,
          payment_method: paymentResult.rows[0]?.method,
          payment_status: paymentResult.rows[0]?.status
        };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// �🛒 CART ENDPOINTS

// Get user's cart items
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await mainDB.query(`
      SELECT 
        ci.cart_item_id,
        ci.album_id,
        ci.quantity,
        al.title as album_name,
        ar.name as artist_name,
        c.name as company_name,
        al.price,
        al.image_url
      FROM cart_items ci
      JOIN albums al ON ci.album_id = al.album_id
      JOIN artists ar ON al.artist_id = ar.artist_id
      JOIN companies c ON ar.company_id = c.company_id
      WHERE ci.user_id = $1
      ORDER BY ci.added_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
/**
 * POST /api/cart - Add item to cart with stock validation
 * 
 * Stock Management Features:
 * - Checks available stock before adding to cart
 * - Prevents adding more than available quantity
 * - Returns error message with available stock count
 * - Handles both new items and quantity updates
 */
app.post("/api/cart", async (req, res) => {
  const { userId, albumId, quantity } = req.body;

  try {
    // Check stock availability before allowing add to cart
    const stockCheck = await mainDB.query(
      'SELECT stock_quantity FROM albums WHERE album_id = $1',
      [albumId]
    );

    if (stockCheck.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    const availableStock = stockCheck.rows[0].stock_quantity;

    // Check if item already exists in cart
    const existing = await mainDB.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );

    let result;
    if (existing.rows.length > 0) {
      const newQuantity = existing.rows[0].quantity + quantity;
      
      // Check if new quantity exceeds stock
      if (newQuantity > availableStock) {
        return res.status(400).json({ 
          error: `Only ${availableStock} items available in stock`,
          availableStock: availableStock,
          currentInCart: existing.rows[0].quantity
        });
      }

      // Update quantity
      result = await mainDB.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND album_id = $3 RETURNING *',
        [quantity, userId, albumId]
      );
    } else {
      // Check if quantity exceeds stock
      if (quantity > availableStock) {
        return res.status(400).json({ 
          error: `Only ${availableStock} items available in stock`,
          availableStock: availableStock
        });
      }

      // Insert new item
      result = await mainDB.query(
        'INSERT INTO cart_items (user_id, album_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, albumId, quantity]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Update cart item quantity
app.put("/api/cart/:userId/:albumId", async (req, res) => {
  const { userId, albumId } = req.params;
  const { quantity } = req.body;

  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await mainDB.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND album_id = $2',
        [userId, albumId]
      );
      res.json({ message: "Item removed from cart" });
    } else {
      // Check stock availability
      const stockCheck = await mainDB.query(
        'SELECT stock_quantity FROM albums WHERE album_id = $1',
        [albumId]
      );

      if (stockCheck.rows.length === 0) {
        return res.status(404).json({ error: "Album not found" });
      }

      const availableStock = stockCheck.rows[0].stock_quantity;
      
      if (quantity > availableStock) {
        return res.status(400).json({ 
          error: `Only ${availableStock} items available in stock`,
          availableStock: availableStock
        });
      }

      // Update quantity
      const result = await mainDB.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND album_id = $3 RETURNING *',
        [quantity, userId, albumId]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove item from cart
app.delete("/api/cart/:userId/:albumId", async (req, res) => {
  const { userId, albumId } = req.params;

  try {
    await mainDB.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND album_id = $2',
      [userId, albumId]
    );
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear entire cart
app.delete("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await mainDB.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// 🛒 Create new order with complete checkout
app.post("/api/orders", async (req, res) => {
  const { user, items, payment, total_amount } = req.body;

  const client = await mainDB.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Create or get user
    let userId;
    const userCheck = await client.query(
      'SELECT user_id FROM users WHERE email = $1',
      [user.email]
    );

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].user_id;
      // Update user info (allow users to update their details at checkout)
      await client.query(
        'UPDATE users SET username = $1, phone = $2, address = $3 WHERE user_id = $4',
        [user.username, user.phone, user.address, userId]
      );
    } else {
      // Create new user (password is optional for guest checkout)
      const newUser = await client.query(
        'INSERT INTO users (username, email, phone, address, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
        [user.username, user.email, user.phone, user.address, user.password || null]
      );
      userId = newUser.rows[0].user_id;
    }

    // 2. Create order
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING order_id',
      [userId, total_amount, 'PENDING', user.address, user.phone]
    );
    const orderId = orderResult.rows[0].order_id;

    // 3. Create order items and decrement stock
    // ⚡ STOCK MANAGEMENT: This is where stock decrements happen when an order is placed
    // - Validates stock availability for each item in the order
    // - Decrements stock_quantity in albums table atomically
    // - Rolls back entire transaction if any item is out of stock
    // - Prevents overselling by checking stock before committing
    for (const item of items) {
      // Check if enough stock is available
      const stockCheck = await client.query(
        'SELECT stock_quantity FROM albums WHERE album_id = $1',
        [item.album_id]
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Album ${item.album_id} not found`);
      }

      const availableStock = stockCheck.rows[0].stock_quantity;
      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for album ${item.album_id}. Available: ${availableStock}, Requested: ${item.quantity}`);
      }

      // Insert order item
      await client.query(
        'INSERT INTO order_items (order_id, album_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.album_id, item.quantity, item.price]
      );

      // ⚡ Decrement stock quantity - this is the actual inventory update
      await client.query(
        'UPDATE albums SET stock_quantity = stock_quantity - $1 WHERE album_id = $2',
        [item.quantity, item.album_id]
      );
    }

    // 4. Create payment record
    await client.query(
      'INSERT INTO payments (order_id, method, amount, status) VALUES ($1, $2, $3, $4)',
      [orderId, payment.method, payment.amount, 'COMPLETED']
    );

    // 5. Update order status to PAID
    await client.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2',
      ['PAID', orderId]
    );

    // 6. Clear user's cart after successful order
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );

    await client.query('COMMIT');

    res.json({ 
      message: "Order placed successfully",
      order_id: orderId,
      user: { email: user.email },
      total_amount: total_amount,
      status: 'PAID',
      payment: { method: payment.method }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || "Failed to place order" });
  } finally {
    client.release();
  }
});

// ========================================
// ========== ADMIN CRUD ENDPOINTS ========
// ========================================
// These endpoints provide full Create, Read, Update, Delete (CRUD)
// operations for admins to manage the database directly from the UI.
// All endpoints return JSON and handle errors gracefully.
//
// Features:
// - Albums: Manage album catalog with stock tracking
// - Artists: Manage K-Pop artists linked to companies
// - Companies: Manage entertainment agencies
// - Users: View and manage user accounts
// ========================================

/**
 * ALBUMS CRUD
 * Manages album catalog including stock quantities
 */

// GET /api/admin/albums - Fetch all albums with artist names
app.get("/api/admin/albums", async (req, res) => {
  try {
    const result = await mainDB.query(`
      SELECT 
        al.album_id, al.title, al.price, al.release_date, 
        al.stock_quantity, al.image_url, al.artist_id,
        ar.name as artist_name
      FROM albums al
      JOIN artists ar ON al.artist_id = ar.artist_id
      ORDER BY al.album_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get albums error:', err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

app.post("/api/admin/albums", async (req, res) => {
  const { title, artist_id, price, release_date, stock_quantity, image_url } = req.body;
  try {
    const result = await mainDB.query(
      'INSERT INTO albums (title, artist_id, price, release_date, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, artist_id, price, release_date, stock_quantity || 0, image_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create album error:', err);
    res.status(500).json({ error: "Failed to create album" });
  }
});

app.put("/api/admin/albums/:id", async (req, res) => {
  const { id } = req.params;
  const { title, artist_id, price, release_date, stock_quantity, image_url } = req.body;
  try {
    const result = await mainDB.query(
      'UPDATE albums SET title = $1, artist_id = $2, price = $3, release_date = $4, stock_quantity = $5, image_url = $6 WHERE album_id = $7 RETURNING *',
      [title, artist_id, price, release_date, stock_quantity, image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update album error:', err);
    res.status(500).json({ error: "Failed to update album" });
  }
});

app.delete("/api/admin/albums/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await mainDB.query('DELETE FROM albums WHERE album_id = $1', [id]);
    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    console.error('Delete album error:', err);
    res.status(500).json({ error: "Failed to delete album" });
  }
});

// ARTISTS CRUD
app.get("/api/admin/artists", async (req, res) => {
  try {
    const result = await mainDB.query(`
      SELECT 
        ar.artist_id, ar.name, ar.company_id, ar.debut_date, ar.country,
        c.name as company_name
      FROM artists ar
      JOIN companies c ON ar.company_id = c.company_id
      ORDER BY ar.artist_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get artists error:', err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.post("/api/admin/artists", async (req, res) => {
  const { name, company_id, debut_date, country } = req.body;
  try {
    const result = await mainDB.query(
      'INSERT INTO artists (name, company_id, debut_date, country) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, company_id, debut_date, country]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create artist error:', err);
    res.status(500).json({ error: "Failed to create artist" });
  }
});

app.put("/api/admin/artists/:id", async (req, res) => {
  const { id } = req.params;
  const { name, company_id, debut_date, country } = req.body;
  try {
    const result = await mainDB.query(
      'UPDATE artists SET name = $1, company_id = $2, debut_date = $3, country = $4 WHERE artist_id = $5 RETURNING *',
      [name, company_id, debut_date, country, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update artist error:', err);
    res.status(500).json({ error: "Failed to update artist" });
  }
});

app.delete("/api/admin/artists/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await mainDB.query('DELETE FROM artists WHERE artist_id = $1', [id]);
    res.json({ message: "Artist deleted successfully" });
  } catch (err) {
    console.error('Delete artist error:', err);
    res.status(500).json({ error: "Failed to delete artist" });
  }
});

// COMPANIES CRUD
app.get("/api/admin/companies", async (req, res) => {
  try {
    const result = await mainDB.query('SELECT * FROM companies ORDER BY company_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get companies error:', err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

app.post("/api/admin/companies", async (req, res) => {
  const { name, country, founded_year } = req.body;
  try {
    const result = await mainDB.query(
      'INSERT INTO companies (name, country, founded_year) VALUES ($1, $2, $3) RETURNING *',
      [name, country, founded_year]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ error: "Failed to create company" });
  }
});

app.put("/api/admin/companies/:id", async (req, res) => {
  const { id } = req.params;
  const { name, country, founded_year } = req.body;
  try {
    const result = await mainDB.query(
      'UPDATE companies SET name = $1, country = $2, founded_year = $3 WHERE company_id = $4 RETURNING *',
      [name, country, founded_year, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ error: "Failed to update company" });
  }
});

app.delete("/api/admin/companies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await mainDB.query('DELETE FROM companies WHERE company_id = $1', [id]);
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

// USERS CRUD
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await mainDB.query('SELECT user_id, username, email, phone, address, role FROM users ORDER BY user_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/admin/users", async (req, res) => {
  const { username, email, password, phone, address, role } = req.body;
  try {
    const result = await mainDB.query(
      'INSERT INTO users (username, email, password, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, email, phone, address, role',
      [username, email, password, phone || '', address || '', role || 'customer']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password, phone, address, role } = req.body;
  try {
    const result = await mainDB.query(
      'UPDATE users SET username = $1, email = $2, password = $3, phone = $4, address = $5, role = $6 WHERE user_id = $7 RETURNING user_id, username, email, phone, address, role',
      [username, email, password, phone, address, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await mainDB.query('DELETE FROM users WHERE user_id = $1', [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ========== END ADMIN CRUD ENDPOINTS ==========

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
