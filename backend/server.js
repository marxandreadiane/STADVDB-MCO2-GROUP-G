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
// ⚡ STOCK MANAGEMENT: When admin confirms order (PAID/SHIPPED), stock is decremented
app.put("/api/admin/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const client = await mainDB.connect();
  
  try {
    await client.query('BEGIN');

    // Get current order status
    const currentOrder = await client.query(
      'SELECT status FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (currentOrder.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = currentOrder.rows[0].status;

    // ⚡ If changing from PENDING to PAID or SHIPPED, decrement stock
    if (currentStatus === 'PENDING' && (status === 'PAID' || status === 'SHIPPED')) {
      // Get all order items
      const orderItems = await client.query(
        'SELECT album_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Decrement stock for each item
      for (const item of orderItems.rows) {
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

        // Decrement stock
        await client.query(
          'UPDATE albums SET stock_quantity = stock_quantity - $1 WHERE album_id = $2',
          [item.quantity, item.album_id]
        );
      }
    }

    // ⚡ If changing to CANCELLED and was previously confirmed (PAID/SHIPPED), restore stock
    if ((currentStatus === 'PAID' || currentStatus === 'SHIPPED') && status === 'CANCELLED') {
      // Get all order items
      const orderItems = await client.query(
        'SELECT album_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // Restore stock for each item
      for (const item of orderItems.rows) {
        await client.query(
          'UPDATE albums SET stock_quantity = stock_quantity + $1 WHERE album_id = $2',
          [item.quantity, item.album_id]
        );
      }
    }

    // Update order status
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, orderId]
    );

    await client.query('COMMIT');

    res.json({ 
      message: "Order status updated", 
      order: result.rows[0],
      stockUpdated: (currentStatus === 'PENDING' && (status === 'PAID' || status === 'SHIPPED')) ? true : false
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', err);
    res.status(500).json({ error: err.message || "Failed to update order status" });
  } finally {
    client.release();
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

    // 3. Create order items (stock will be decremented when admin confirms)
    // ⚡ STOCK MANAGEMENT: Stock is NOT decremented at order placement
    // - Stock will be decremented when admin confirms the order (changes status to PAID/SHIPPED)
    // - This prevents stock from being locked for unconfirmed/pending orders
    // - Admin has control over when inventory is actually committed
    for (const item of items) {
      // Validate album exists
      const albumCheck = await client.query(
        'SELECT album_id FROM albums WHERE album_id = $1',
        [item.album_id]
      );

      if (albumCheck.rows.length === 0) {
        throw new Error(`Album ${item.album_id} not found`);
      }

      // Insert order item (no stock decrement yet)
      await client.query(
        'INSERT INTO order_items (order_id, album_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.album_id, item.quantity, item.price]
      );
    }

    // 4. Create payment record
    await client.query(
      'INSERT INTO payments (order_id, method, amount, status) VALUES ($1, $2, $3, $4)',
      [orderId, payment.method, payment.amount, 'COMPLETED']
    );

    // 5. Keep order status as PENDING (admin will confirm later)
    // Order will remain PENDING until admin reviews and updates the status

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

// ========================================
// ========== OLAP REPORTS ENDPOINTS ==========
// ========================================

// 📊 ROLL UP: Sales aggregated by Company → Artist → Album (hierarchical)
app.get("/api/reports/rollup-sales", async (req, res) => {
  const { level } = req.query; // 'company', 'artist', or 'album'
  
  try {
    let query = '';
    
    if (level === 'company') {
      // Roll up to company level (highest aggregation)
      query = `
        SELECT 
          c.name as company_name,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(oi.quantity) as total_units_sold,
          SUM(oi.quantity * oi.price) as total_revenue
        FROM companies c
        JOIN artists ar ON c.company_id = ar.company_id
        JOIN albums al ON ar.artist_id = al.artist_id
        JOIN order_items oi ON al.album_id = oi.album_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        GROUP BY c.company_id, c.name
        ORDER BY total_revenue DESC
      `;
    } else if (level === 'artist') {
      // Roll up to artist level
      query = `
        SELECT 
          c.name as company_name,
          ar.name as artist_name,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(oi.quantity) as total_units_sold,
          SUM(oi.quantity * oi.price) as total_revenue
        FROM companies c
        JOIN artists ar ON c.company_id = ar.company_id
        JOIN albums al ON ar.artist_id = al.artist_id
        JOIN order_items oi ON al.album_id = oi.album_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        GROUP BY c.company_id, c.name, ar.artist_id, ar.name
        ORDER BY total_revenue DESC
      `;
    } else {
      // Most detailed level (album)
      query = `
        SELECT 
          c.name as company_name,
          ar.name as artist_name,
          al.title as album_title,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(oi.quantity) as total_units_sold,
          SUM(oi.quantity * oi.price) as total_revenue
        FROM companies c
        JOIN artists ar ON c.company_id = ar.company_id
        JOIN albums al ON ar.artist_id = al.artist_id
        JOIN order_items oi ON al.album_id = oi.album_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        GROUP BY c.company_id, c.name, ar.artist_id, ar.name, al.album_id, al.title
        ORDER BY total_revenue DESC
      `;
    }
    
    const result = await mainDB.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Roll up error:', err);
    res.status(500).json({ error: "Failed to fetch rollup report" });
  }
});

// 🔍 DRILL DOWN: Start from summary and drill into details
app.get("/api/reports/drilldown/:type/:id", async (req, res) => {
  const { type, id } = req.params; // type: 'company' or 'artist', id: entity id
  
  try {
    let query = '';
    
    if (type === 'company') {
      // Drill down from company to see all artists
      query = `
        SELECT 
          ar.artist_id,
          ar.name as artist_name,
          ar.fandom_name,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(oi.quantity) as total_units_sold,
          SUM(oi.quantity * oi.price) as total_revenue
        FROM artists ar
        JOIN albums al ON ar.artist_id = al.artist_id
        LEFT JOIN order_items oi ON al.album_id = oi.album_id
        LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        WHERE ar.company_id = $1
        GROUP BY ar.artist_id, ar.name, ar.fandom_name
        ORDER BY total_revenue DESC NULLS LAST
      `;
    } else if (type === 'artist') {
      // Drill down from artist to see all albums
      query = `
        SELECT 
          al.album_id,
          al.title as album_title,
          al.release_date,
          al.price,
          al.stock_quantity,
          COALESCE(COUNT(DISTINCT o.order_id), 0) as total_orders,
          COALESCE(SUM(oi.quantity), 0) as total_units_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
        FROM albums al
        LEFT JOIN order_items oi ON al.album_id = oi.album_id
        LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        WHERE al.artist_id = $1
        GROUP BY al.album_id, al.title, al.release_date, al.price, al.stock_quantity
        ORDER BY total_revenue DESC
      `;
    }
    
    const result = await mainDB.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Drill down error:', err);
    res.status(500).json({ error: "Failed to fetch drilldown report" });
  }
});

// 🎲 DICE: Multi-dimensional filtering (Date Range + Status + Price Range)
app.get("/api/reports/dice", async (req, res) => {
  const { startDate, endDate, status, minPrice, maxPrice } = req.query;
  
  try {
    let whereConditions = ['1=1'];
    let params = [];
    let paramIndex = 1;
    
    if (startDate) {
      whereConditions.push(`o.order_date >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereConditions.push(`o.order_date <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }
    
    if (status && status !== 'ALL') {
      whereConditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (minPrice) {
      whereConditions.push(`oi.price >= $${paramIndex}`);
      params.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice) {
      whereConditions.push(`oi.price <= $${paramIndex}`);
      params.push(maxPrice);
      paramIndex++;
    }
    
    const query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.status,
        u.username,
        u.email,
        al.title as album_title,
        ar.name as artist_name,
        c.name as company_name,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) as total_amount
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN albums al ON oi.album_id = al.album_id
      JOIN artists ar ON al.artist_id = ar.artist_id
      JOIN companies c ON ar.company_id = c.company_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY o.order_date DESC
      LIMIT 100
    `;
    
    const result = await mainDB.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Dice error:', err);
    res.status(500).json({ error: "Failed to fetch dice report" });
  }
});

// 🔪 SLICE: Single dimension filtering (e.g., sales for specific time period)
app.get("/api/reports/slice/:dimension", async (req, res) => {
  const { dimension } = req.params; // 'time', 'status', 'company', 'artist'
  const { value } = req.query;
  
  try {
    let query = '';
    let params = [];
    
    if (dimension === 'time') {
      // Slice by time period (e.g., specific month/year)
      query = `
        SELECT 
          DATE_TRUNC('month', o.order_date) as month,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(oi.quantity) as total_units_sold,
          SUM(oi.quantity * oi.price) as total_revenue
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
          ${value ? `AND DATE_TRUNC('month', o.order_date) = $1` : ''}
        GROUP BY DATE_TRUNC('month', o.order_date)
        ORDER BY month DESC
      `;
      if (value) params.push(value);
    } else if (dimension === 'status') {
      // Slice by order status
      query = `
        SELECT 
          o.status,
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(o.total_amount) as total_revenue,
          AVG(o.total_amount) as avg_order_value
        FROM orders o
        ${value ? `WHERE o.status = $1` : ''}
        GROUP BY o.status
        ORDER BY total_orders DESC
      `;
      if (value) params.push(value);
    } else if (dimension === 'company') {
      // Slice by company
      query = `
        SELECT 
          c.name as company_name,
          ar.name as artist_name,
          al.title as album_title,
          SUM(oi.quantity) as units_sold,
          SUM(oi.quantity * oi.price) as revenue
        FROM companies c
        JOIN artists ar ON c.company_id = ar.company_id
        JOIN albums al ON ar.artist_id = al.artist_id
        JOIN order_items oi ON al.album_id = oi.album_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
          ${value ? `AND c.company_id = $1` : ''}
        GROUP BY c.name, ar.name, al.title
        ORDER BY revenue DESC
      `;
      if (value) params.push(value);
    } else if (dimension === 'artist') {
      // Slice by artist
      query = `
        SELECT 
          ar.name as artist_name,
          al.title as album_title,
          al.release_date,
          SUM(oi.quantity) as units_sold,
          SUM(oi.quantity * oi.price) as revenue
        FROM artists ar
        JOIN albums al ON ar.artist_id = al.artist_id
        JOIN order_items oi ON al.album_id = oi.album_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
          ${value ? `AND ar.artist_id = $1` : ''}
        GROUP BY ar.name, al.title, al.release_date
        ORDER BY revenue DESC
      `;
      if (value) params.push(value);
    }
    
    const result = await mainDB.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Slice error:', err);
    res.status(500).json({ error: "Failed to fetch slice report" });
  }
});

// 📈 Additional: Sales trends over time
app.get("/api/reports/sales-trends", async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('day', o.order_date) as date,
        COUNT(DISTINCT o.order_id) as orders,
        SUM(oi.quantity) as units,
        SUM(oi.quantity * oi.price) as revenue
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        AND o.order_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', o.order_date)
      ORDER BY date DESC
    `;
    
    const result = await mainDB.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Sales trends error:', err);
    res.status(500).json({ error: "Failed to fetch sales trends" });
  }
});

// 📊 Get dimension values for filters
app.get("/api/reports/dimensions", async (req, res) => {
  try {
    const [companies, artists, statuses] = await Promise.all([
      mainDB.query('SELECT company_id, name FROM companies ORDER BY name'),
      mainDB.query('SELECT artist_id, name FROM artists ORDER BY name'),
      mainDB.query('SELECT DISTINCT status FROM orders ORDER BY status')
    ]);
    
    res.json({
      companies: companies.rows,
      artists: artists.rows,
      statuses: statuses.rows.map(r => r.status)
    });
  } catch (err) {
    console.error('Dimensions error:', err);
    res.status(500).json({ error: "Failed to fetch dimensions" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
