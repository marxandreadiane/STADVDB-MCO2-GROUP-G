// server.js
import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

const { Pool } = pkg;

dotenv.config();
const ACTIONS = {
  create: "Adding",
  update: "Editing",
  delete: "Deleting",
};

const formatValidationError = (entity, action, reason) =>
  `${action} ${entity} failed: ${reason}`;

const parseInteger = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const validateAlbumPayload = (data, actionLabel) => {
  if (data.image_url && !data.image_url.startsWith("/images/albums/")) {
    return {
      error: formatValidationError(
        "album",
        actionLabel,
        "Image path must be inside /images/albums/"
      ),
    };
  }

  const trimmedTitle = data.title?.trim();
  if (!trimmedTitle) {
    return {
      error: formatValidationError("album", actionLabel, "Title is required"),
    };
  }

  const artistId = parseInteger(data.artist_id);
  if (!artistId) {
    return {
      error: formatValidationError(
        "album",
        actionLabel,
        "A valid artist must be selected"
      ),
    };
  }

  const numericPrice =
    data.price !== undefined && data.price !== null
      ? parseFloat(data.price)
      : null;
  if (
    numericPrice === null ||
    Number.isNaN(numericPrice) ||
    numericPrice <= 0
  ) {
    return {
      error: formatValidationError(
        "album",
        actionLabel,
        "Price must be a positive number"
      ),
    };
  }

  const numericStock =
    data.stock_quantity !== undefined && data.stock_quantity !== null
      ? parseInteger(data.stock_quantity)
      : 0;

  if (numericStock === null || numericStock < 0) {
    return {
      error: formatValidationError(
        "album",
        actionLabel,
        "Stock quantity must be a non-negative integer"
      ),
    };
  }

  let releaseDate = null;
  if (data.release_date) {
    const parsedDate = new Date(data.release_date);
    if (Number.isNaN(parsedDate.getTime())) {
      return {
        error: formatValidationError(
          "album",
          actionLabel,
          "Release date is invalid"
        ),
      };
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const minDate = new Date("1980-01-01");
    if (parsedDate > today) {
      return {
        error: formatValidationError(
          "album",
          actionLabel,
          "Release date cannot be in the future"
        ),
      };
    }
    if (parsedDate < minDate) {
      return {
        error: formatValidationError(
          "album",
          actionLabel,
          "Release date must be on or after January 1, 1980"
        ),
      };
    }
    releaseDate = data.release_date;
  }

  return {
    title: trimmedTitle,
    artistId,
    price: numericPrice,
    releaseDate,
    stockQuantity: numericStock,
    imageUrl: data.image_url || null,
  };
};

const validateCompanyPayload = (data, actionLabel) => {
  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return {
      error: formatValidationError("company", actionLabel, "Name is required"),
    };
  }

  let foundedYear = null;
  if (
    data.founded_year !== undefined &&
    data.founded_year !== null &&
    data.founded_year !== ""
  ) {
    const parsedYear = parseInteger(data.founded_year);
    const currentYear = new Date().getFullYear();
    if (parsedYear === null || parsedYear < 1980 || parsedYear > currentYear) {
      return {
        error: formatValidationError(
          "company",
          actionLabel,
          `Founded year must be between 1980 and ${currentYear}`
        ),
      };
    }
    foundedYear = parsedYear;
  }

  return {
    name: trimmedName,
    headquarters: data.headquarters?.trim() || null,
    foundedYear,
    ceoName: data.ceo_name?.trim() || null,
  };
};

const validateUserPayload = (data, actionLabel) => {
  const trimmedUsername = data.username?.trim();
  if (!trimmedUsername) {
    return {
      error: formatValidationError("user", actionLabel, "Username is required"),
    };
  }

  const trimmedEmail = data.email?.trim();
  if (!trimmedEmail) {
    return {
      error: formatValidationError("user", actionLabel, "Email is required"),
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      error: formatValidationError(
        "user",
        actionLabel,
        "Email address is invalid"
      ),
    };
  }

  const sanitized = {
    username: trimmedUsername,
    email: trimmedEmail.toLowerCase(),
    password: data.password ?? null,
    phone: data.phone?.trim() || "",
    address: data.address?.trim() || "",
    role: data.role?.trim() || "customer",
  };

  if (!["customer", "admin", "staff"].includes(sanitized.role)) {
    return {
      error: formatValidationError(
        "user",
        actionLabel,
        "Role must be customer, admin, or staff"
      ),
    };
  }

  return sanitized;
};
const app = express();
app.use(cors());
app.use(express.json());

// Create DB connections (PostgreSQL)
const mainDB = new Pool({
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT || 5432,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASS,
  database: process.env.DB_MAIN_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Set search_path to public schema for Supabase
mainDB.on("connect", (client) => {
  client.query("SET search_path TO public");
  client.query("SET statement_timeout TO 0");
});

const reportsDB = new Pool({
  host: process.env.DB_REPORTS_HOST,
  port: process.env.DB_REPORTS_PORT || 5432,
  user: process.env.DB_REPORTS_USER,
  password: process.env.DB_REPORTS_PASS,
  database: process.env.DB_REPORTS_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Set search_path to public schema for Supabase
reportsDB.on("connect", (client) => {
  client.query("SET search_path TO public");
  client.query("SET statement_timeout TO 0");
});

const ANALYTICS_STATUSES = ["PAID", "SHIPPED", "DELIVERED"];

const TABLE_SYNC_CONFIG = [
  {
    name: "users",
    primaryKey: "user_id",
    columns: [
      "user_id",
      "username",
      "email",
      "password",
      "phone",
      "address",
      "role",
      "created_at",
    ],
    sequence: "users_user_id_seq",
  },
  {
    name: "companies",
    primaryKey: "company_id",
    columns: ["company_id", "name", "headquarters", "founded_year", "ceo_name"],
    sequence: "companies_company_id_seq",
  },
  {
    name: "artists",
    primaryKey: "artist_id",
    columns: ["artist_id", "company_id", "name", "debut_year", "fandom_name"],
    sequence: "artists_artist_id_seq",
  },
  {
    name: "albums",
    primaryKey: "album_id",
    columns: [
      "album_id",
      "artist_id",
      "title",
      "release_date",
      "price",
      "stock_quantity",
      "image_url",
    ],
    sequence: "albums_album_id_seq",
  },
  {
    name: "orders",
    primaryKey: "order_id",
    columns: [
      "order_id",
      "user_id",
      "order_date",
      "status",
      "total_amount",
      "shipping_address",
      "phone",
    ],
    sequence: "orders_order_id_seq",
  },
  {
    name: "order_items",
    primaryKey: "order_item_id",
    columns: ["order_item_id", "order_id", "album_id", "quantity", "price"],
    sequence: "order_items_order_item_id_seq",
  },
];

const REPORTS_SYNC_BATCH =
  parseInt(process.env.REPORTS_SYNC_BATCH || "1000", 10) || 1000;

const syncReportsDatabase = async () => {
  const reportsClient = await reportsDB.connect();
  try {
    await reportsClient.query("SET statement_timeout TO 0");
    await reportsClient.query("BEGIN");

    for (const table of TABLE_SYNC_CONFIG) {

      const insertBase = `INSERT INTO ${table.name} (${table.columns.join(
        ", "
      )}) VALUES `;
      const columnCount = table.columns.length;
      const { rows: maxRows } = await reportsClient.query(
        `SELECT COALESCE(MAX(${table.primaryKey}), 0) AS max FROM ${table.name}`
      );
      let lastPrimaryKey = parseInt(maxRows[0]?.max || 0, 10);

      // Fetch and insert in batches to avoid long-running statements
      while (true) {
        const selectQuery = `
          SELECT ${table.columns.join(", ")}
          FROM ${table.name}
          WHERE ${table.primaryKey} > $1
          ORDER BY ${table.primaryKey} ASC
          LIMIT $2
        `;
        const { rows } = await mainDB.query(selectQuery, [
          lastPrimaryKey,
          REPORTS_SYNC_BATCH,
        ]);

        if (rows.length === 0) {
          break;
        }

        const values = [];
        const placeholders = rows
          .map((row, rowIdx) => {
            const rowPlaceholders = table.columns.map(
              (_, colIdx) => `$${rowIdx * columnCount + colIdx + 1}`
            );
            values.push(...table.columns.map((col) => row[col]));
            return `(${rowPlaceholders.join(", ")})`;
          })
          .join(", ");

        await reportsClient.query(insertBase + placeholders, values);

        lastPrimaryKey = rows[rows.length - 1][table.primaryKey];

      }

      if (table.sequence) {
        await reportsClient.query(
          `SELECT setval('${table.sequence}', (SELECT COALESCE(MAX(${table.primaryKey}), 1) FROM ${table.name}), true)`
        );
      }
    }

    await reportsClient.query("COMMIT");
    console.log("Reports database refreshed from main database");
  } catch (err) {
    await reportsClient.query("ROLLBACK");
    console.error("Reports sync error:", err);
    throw err;
  } finally {
    reportsClient.release();
  }
};

app.get("/", (req, res) => {
  res.send("KPop Store API is running 🚀");
});

// Authentication endpoints

// Sign up endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, phone, address } = req.body;

  try {
    // Check if user already exists
    const existingUser = await mainDB.query(
      "SELECT user_id FROM public.users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create new user with password (default role: customer)
    const result = await mainDB.query(
      "INSERT INTO public.users (username, email, password, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, email, phone, address, role",
      [username, email, password, phone || "", address || "", "customer"]
    );

    const user = result.rows[0];
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await mainDB.query(
      "SELECT user_id, username, email, phone, address, role FROM public.users WHERE email = $1 AND password = $2",
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
      role: user.role || "customer",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get all albums (transactional DB)
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

// ORDERS ENDPOINTS

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
      ORDER BY o.order_id ASC
    `);

    res.json(ordersResult.rows);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status (Admin)
// STOCK MANAGEMENT: When admin confirms order (PAID/SHIPPED), stock is decremented
app.put("/api/admin/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // Get current order status
    const currentOrder = await client.query(
      "SELECT status FROM orders WHERE order_id = $1",
      [orderId]
    );

    if (currentOrder.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = currentOrder.rows[0].status;

    // If changing from PENDING to PAID or SHIPPED, decrement stock
    if (
      currentStatus === "PENDING" &&
      (status === "PAID" || status === "SHIPPED")
    ) {
      // Get all order items
      const orderItems = await client.query(
        "SELECT album_id, quantity FROM order_items WHERE order_id = $1",
        [orderId]
      );

      // Decrement stock for each item
      for (const item of orderItems.rows) {
        // Check if enough stock is available
        const stockCheck = await client.query(
          "SELECT stock_quantity FROM albums WHERE album_id = $1",
          [item.album_id]
        );

        if (stockCheck.rows.length === 0) {
          throw new Error(`Album ${item.album_id} not found`);
        }

        const availableStock = stockCheck.rows[0].stock_quantity;
        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for album ${item.album_id}. Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }

        // Decrement stock
        await client.query(
          "UPDATE albums SET stock_quantity = stock_quantity - $1 WHERE album_id = $2",
          [item.quantity, item.album_id]
        );
      }
    }

    // If changing to CANCELLED and was previously confirmed (PAID/SHIPPED), restore stock
    if (
      (currentStatus === "PAID" || currentStatus === "SHIPPED") &&
      status === "CANCELLED"
    ) {
      // Get all order items
      const orderItems = await client.query(
        "SELECT album_id, quantity FROM order_items WHERE order_id = $1",
        [orderId]
      );

      // Restore stock for each item
      for (const item of orderItems.rows) {
        await client.query(
          "UPDATE albums SET stock_quantity = stock_quantity + $1 WHERE album_id = $2",
          [item.quantity, item.album_id]
        );
      }
    }

    // Update order status
    const result = await client.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, orderId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Order status updated",
      order: result.rows[0],
      stockUpdated:
        currentStatus === "PENDING" &&
        (status === "PAID" || status === "SHIPPED")
          ? true
          : false,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update order status error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to update order status" });
  } finally {
    client.release();
  }
});

// Get user's order history
app.get("/api/orders/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Get orders
    const ordersResult = await mainDB.query(
      `
      SELECT 
        o.order_id,
        o.order_date,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.phone
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.order_id ASC
    `,
      [userId]
    );

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await mainDB.query(
          `
          SELECT 
            oi.quantity,
            oi.price,
            al.title as album_name,
            ar.name as artist_name
          FROM order_items oi
          JOIN albums al ON oi.album_id = al.album_id
          JOIN artists ar ON al.artist_id = ar.artist_id
          WHERE oi.order_id = $1
        `,
          [order.order_id]
        );

        // Get payment info
        const paymentResult = await mainDB.query(
          `
          SELECT method, status
          FROM payments
          WHERE order_id = $1
          LIMIT 1
        `,
          [order.order_id]
        );

        return {
          ...order,
          items: itemsResult.rows,
          payment_method: paymentResult.rows[0]?.method,
          payment_status: paymentResult.rows[0]?.status,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// CART ENDPOINTS

// Get user's cart items
app.get("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await mainDB.query(
      `
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
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get cart error:", err);
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
      "SELECT stock_quantity FROM albums WHERE album_id = $1",
      [albumId]
    );

    if (stockCheck.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    const availableStock = stockCheck.rows[0].stock_quantity;

    // Check if item already exists in cart
    const existing = await mainDB.query(
      "SELECT cart_item_id, quantity FROM cart_items WHERE user_id = $1 AND album_id = $2",
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
          currentInCart: existing.rows[0].quantity,
        });
      }

      // Update quantity
      result = await mainDB.query(
        "UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND album_id = $3 RETURNING *",
        [quantity, userId, albumId]
      );
    } else {
      // Check if quantity exceeds stock
      if (quantity > availableStock) {
        return res.status(400).json({
          error: `Only ${availableStock} items available in stock`,
          availableStock: availableStock,
        });
      }

      // Insert new item
      result = await mainDB.query(
        "INSERT INTO cart_items (user_id, album_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [userId, albumId, quantity]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Add to cart error:", err);
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
        "DELETE FROM cart_items WHERE user_id = $1 AND album_id = $2",
        [userId, albumId]
      );
      res.json({ message: "Item removed from cart" });
    } else {
      // Check stock availability
      const stockCheck = await mainDB.query(
        "SELECT stock_quantity FROM albums WHERE album_id = $1",
        [albumId]
      );

      if (stockCheck.rows.length === 0) {
        return res.status(404).json({ error: "Album not found" });
      }

      const availableStock = stockCheck.rows[0].stock_quantity;

      if (quantity > availableStock) {
        return res.status(400).json({
          error: `Only ${availableStock} items available in stock`,
          availableStock: availableStock,
        });
      }

      // Update quantity
      const result = await mainDB.query(
        "UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND album_id = $3 RETURNING *",
        [quantity, userId, albumId]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove item from cart
app.delete("/api/cart/:userId/:albumId", async (req, res) => {
  const { userId, albumId } = req.params;

  try {
    await mainDB.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND album_id = $2",
      [userId, albumId]
    );
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear entire cart
app.delete("/api/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await mainDB.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Create new order with complete checkout
app.post("/api/orders", async (req, res) => {
  const { user, items, payment, total_amount } = req.body;

  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // 1. Create or get user
    let userId;
    const userCheck = await client.query(
      "SELECT user_id FROM users WHERE email = $1",
      [user.email]
    );

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].user_id;
      // Update user info 
      await client.query(
        "UPDATE users SET username = $1, phone = $2, address = $3 WHERE user_id = $4",
        [user.username, user.phone, user.address, userId]
      );
    } else {
      // Create new user 
      const newUser = await client.query(
        "INSERT INTO users (username, email, phone, address, password) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
        [
          user.username,
          user.email,
          user.phone,
          user.address,
          user.password || null,
        ]
      );
      userId = newUser.rows[0].user_id;
    }

    // 2. Create order
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, total_amount, status, shipping_address, phone) VALUES ($1, $2, $3, $4, $5) RETURNING order_id",
      [userId, total_amount, "PAID", user.address, user.phone]
    );
    const orderId = orderResult.rows[0].order_id;

    // 3. Create order items (stock will be decremented when admin confirms)
    // STOCK MANAGEMENT: Stock is NOT decremented at order placement
    // - Stock will be decremented when admin confirms the order (changes status to PAID/SHIPPED)
    // - This prevents stock from being locked for unconfirmed/pending orders
    // - Admin has control over when inventory is actually committed
    for (const item of items) {
          // ⚡ 1. CHECK STOCK FIRST
          const stockCheck = await client.query(
            "SELECT stock_quantity FROM albums WHERE album_id = $1",
            [item.album_id]
          );

          if (stockCheck.rows.length === 0) {
            throw new Error(`Album ${item.album_id} not found`);
          }

          const availableStock = stockCheck.rows[0].stock_quantity;
          if (availableStock < item.quantity) {
            // The error that JMeter will catch when stock hits 0
            throw new Error(
              `Insufficient stock. Only ${availableStock} items available.`
            );
          }

          // ⚡ 2. DECREMENT STOCK IMMEDIATELY (The Atomic Update)
          await client.query(
            "UPDATE albums SET stock_quantity = stock_quantity - $1 WHERE album_id = $2",
            [item.quantity, item.album_id]
          );

          // 3. Insert order item
          await client.query(
            "INSERT INTO order_items (order_id, album_id, quantity, price) VALUES ($1, $2, $3, $4)",
            [orderId, item.album_id, item.quantity, item.price]
          );
    }

    // 4. Create payment record
    await client.query(
      "INSERT INTO payments (order_id, method, amount, status) VALUES ($1, $2, $3, $4)",
      [orderId, payment.method, payment.amount, "COMPLETED"]
    );

    // 5. Keep order status as PENDING (admin will confirm later)
    // Order will remain PENDING until admin reviews and updates the status

    // 6. Clear user's cart after successful order
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    await client.query("COMMIT");

    res.json({
      message: "Order placed successfully",
      order_id: orderId,
      user: { email: user.email },
      total_amount: total_amount,
      status: "PAID",
      payment: { method: payment.method },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Order creation error:", err);
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
      ORDER BY al.album_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get albums error:", err);
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

app.post("/api/admin/albums", async (req, res) => {
  const validation = validateAlbumPayload(req.body, ACTIONS.create);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const insertAlbum = async () => {
    return mainDB.query(
      "INSERT INTO albums (title, artist_id, price, release_date, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        validation.title,
        validation.artistId,
        validation.price,
        validation.releaseDate || null,
        validation.stockQuantity,
        validation.imageUrl,
      ]
    );
  };

  try {
    const result = await insertAlbum();
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create album error:", err);

    if (err.code === "23505" && err.constraint === "unique_album_per_artist") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "album",
            ACTIONS.create,
            "This title already exists for the selected artist"
          ),
        });
    }

    // Handle out-of-sync sequence errors by fixing and retrying once
    if (err.code === "23505" && err.constraint === "albums_pkey") {
      try {
        await mainDB.query(
          "SELECT setval('albums_album_id_seq', (SELECT COALESCE(MAX(album_id), 1) FROM albums), true)"
        );
        const retryResult = await insertAlbum();
        return res.json(retryResult.rows[0]);
      } catch (seqErr) {
        console.error("Album sequence repair error:", seqErr);
        return res.status(500).json({
          error: formatValidationError(
            "album",
            ACTIONS.create,
            "Database sequence is out of sync. Please contact an administrator."
          ),
        });
      }
    }

    res.status(500).json({ error: "Failed to create album" });
  }
});

app.put("/api/admin/albums/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "album",
          ACTIONS.update,
          "Invalid album ID"
        ),
      });
  }

  const validation = validateAlbumPayload(req.body, ACTIONS.update);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await mainDB.query(
      "UPDATE albums SET title = $1, artist_id = $2, price = $3, release_date = $4, stock_quantity = $5, image_url = $6 WHERE album_id = $7 RETURNING *",
      [
        validation.title,
        validation.artistId,
        validation.price,
        validation.releaseDate || null,
        validation.stockQuantity,
        validation.imageUrl,
        numericId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update album error:", err);
    if (err.code === "23505" && err.constraint === "unique_album_per_artist") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "album",
            ACTIONS.update,
            "This title already exists for the selected artist"
          ),
        });
    }
    res.status(500).json({ error: "Failed to update album" });
  }
});

app.delete("/api/admin/albums/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "album",
          ACTIONS.delete,
          "Invalid album ID"
        ),
      });
  }
  const { force, setStockZero } = req.query; // force=true for cascade delete, setStockZero=true to disable instead
  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // Option 1: Set stock to 0 instead of deleting
    if (setStockZero === "true") {
      const result = await client.query(
        "UPDATE albums SET stock_quantity = 0 WHERE album_id = $1 RETURNING *",
        [numericId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Album not found" });
      }

      await client.query("COMMIT");
      return res.json({
        message: "Album stock set to 0 (disabled)",
        album: result.rows[0],
      });
    }

    // Check if album has any orders
    const ordersCheck = await client.query(
      "SELECT COUNT(*) as count FROM order_items WHERE album_id = $1",
      [numericId]
    );

    const orderCount = parseInt(ordersCheck.rows[0].count);

    // Option 2: Force delete with cascade
    if (force === "true" && orderCount > 0) {
      // Delete all order items first
      await client.query("DELETE FROM order_items WHERE album_id = $1", [
        numericId,
      ]);

      // Remove from carts
      await client.query("DELETE FROM cart_items WHERE album_id = $1", [
        numericId,
      ]);

      // Delete the album
      const result = await client.query(
        "DELETE FROM albums WHERE album_id = $1 RETURNING *",
        [numericId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Album not found" });
      }

      await client.query("COMMIT");
      return res.json({
        message: "Album and all related records deleted successfully",
        deletedOrderItems: orderCount,
      });
    }

    // Option 3: Safe delete (default)
    if (orderCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cannot delete album with existing orders",
        suggestion:
          "Use ?setStockZero=true to disable the album or ?force=true to delete everything",
        orderCount: orderCount,
      });
    }

    // Check if album is in any carts
    const cartCheck = await client.query(
      "SELECT COUNT(*) as count FROM cart_items WHERE album_id = $1",
      [numericId]
    );

    // Remove from carts if present
    if (parseInt(cartCheck.rows[0].count) > 0) {
      await client.query("DELETE FROM cart_items WHERE album_id = $1", [
        numericId,
      ]);
    }

    // Delete the album
    const result = await client.query(
      "DELETE FROM albums WHERE album_id = $1 RETURNING *",
      [numericId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Album not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete album error:", err);
    res.status(500).json({ error: "Failed to delete album: " + err.message });
  } finally {
    client.release();
  }
});

// ARTISTS CRUD
app.get("/api/admin/artists", async (req, res) => {
  try {
    const result = await mainDB.query(`
      SELECT 
        ar.artist_id, ar.name, ar.company_id, ar.debut_year, ar.fandom_name,
        c.name as company_name
      FROM artists ar
      JOIN companies c ON ar.company_id = c.company_id
      ORDER BY ar.artist_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get artists error:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

app.post("/api/admin/artists", async (req, res) => {
  const { name, company_id, debut_year, fandom_name } = req.body;

  // Validate required fields
  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "artist",
          ACTIONS.create,
          "Name is required"
        ),
      });
  }

  if (!company_id) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "artist",
          ACTIONS.create,
          "Company is required"
        ),
      });
  }

  try {
    const trimmedName = name.trim();

    // Check for case-insensitive duplicate name
    const duplicateCheck = await mainDB.query(
      "SELECT artist_id, name FROM artists WHERE LOWER(name) = LOWER($1)",
      [trimmedName]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: formatValidationError(
          "artist",
          ACTIONS.create,
          `An artist named "${duplicateCheck.rows[0].name}" already exists`
        ),
      });
    }

    // Fix sequence if it's out of sync (handles duplicate key errors)
    try {
      await mainDB.query(
        "SELECT setval('artists_artist_id_seq', (SELECT COALESCE(MAX(artist_id), 1) FROM artists), true)"
      );
    } catch (seqErr) {
      // Sequence might not exist or already be correct, continue anyway
      console.log("Sequence sync note:", seqErr.message);
    }

    const result = await mainDB.query(
      "INSERT INTO artists (name, company_id, debut_year, fandom_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        trimmedName,
        parseInt(company_id),
        debut_year || null,
        fandom_name ? fandom_name.trim() : null,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create artist error:", err);
    // Return more specific error message
    if (err.code === "23503") {
      // Foreign key violation
      res
        .status(400)
        .json({
          error: formatValidationError(
            "artist",
            ACTIONS.create,
            "Invalid company selected"
          ),
        });
    } else if (err.code === "23505" && err.constraint === "artists_pkey") {
      // Primary key violation - sequence is out of sync, try to fix and retry once
      try {
        await mainDB.query(
          "SELECT setval('artists_artist_id_seq', (SELECT COALESCE(MAX(artist_id), 1) FROM artists), true)"
        );
        // Retry the insert
        const retryResult = await mainDB.query(
          "INSERT INTO artists (name, company_id, debut_year, fandom_name) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            trimmedName,
            parseInt(company_id),
            debut_year || null,
            fandom_name ? fandom_name.trim() : null,
          ]
        );
        return res.json(retryResult.rows[0]);
      } catch (retryErr) {
        res.status(500).json({
          error: formatValidationError(
            "artist",
            ACTIONS.create,
            "Database sequence is out of sync. Please contact an administrator."
          ),
        });
      }
    } else {
      res.status(500).json({ error: err.message || "Failed to create artist" });
    }
  }
});

app.put("/api/admin/artists/:id", async (req, res) => {
  const { id } = req.params;
  const { name, company_id, debut_year, fandom_name } = req.body;

  // Validate required fields
  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "artist",
          ACTIONS.update,
          "Name is required"
        ),
      });
  }

  if (!company_id) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "artist",
          ACTIONS.update,
          "Company is required"
        ),
      });
  }

  try {
    const trimmedName = name.trim();

    // Check for case-insensitive duplicate name (excluding current artist)
    const duplicateCheck = await mainDB.query(
      "SELECT artist_id, name FROM artists WHERE LOWER(name) = LOWER($1) AND artist_id != $2",
      [trimmedName, parseInt(id)]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: formatValidationError(
          "artist",
          ACTIONS.update,
          `An artist named "${duplicateCheck.rows[0].name}" already exists`
        ),
      });
    }

    const result = await mainDB.query(
      "UPDATE artists SET name = $1, company_id = $2, debut_year = $3, fandom_name = $4 WHERE artist_id = $5 RETURNING *",
      [
        trimmedName,
        parseInt(company_id),
        debut_year || null,
        fandom_name ? fandom_name.trim() : null,
        parseInt(id),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update artist error:", err);
    if (err.code === "23503") {
      // Foreign key violation
      res
        .status(400)
        .json({
          error: formatValidationError(
            "artist",
            ACTIONS.update,
            "Invalid company selected"
          ),
        });
    } else {
      res.status(500).json({ error: err.message || "Failed to update artist" });
    }
  }
});

app.delete("/api/admin/artists/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "artist",
          ACTIONS.delete,
          "Invalid artist ID"
        ),
      });
  }
  const { force } = req.query; // force=true for cascade delete
  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // Check if artist has any albums
    const albumsCheck = await client.query(
      "SELECT album_id FROM albums WHERE artist_id = $1",
      [numericId]
    );

    const albumCount = albumsCheck.rows.length;
    let reassignedAlbums = 0;

    // Option 1: Force delete with cascade
    if (force === "true" && albumCount > 0) {
      let deletedOrderItems = 0;

      // For each album, delete related records
      for (const album of albumsCheck.rows) {
        // Delete order items
        const orderItemsResult = await client.query(
          "DELETE FROM order_items WHERE album_id = $1",
          [album.album_id]
        );
        deletedOrderItems += orderItemsResult.rowCount;

        // Delete cart items
        await client.query("DELETE FROM cart_items WHERE album_id = $1", [
          album.album_id,
        ]);
      }

      // Delete all albums
      await client.query("DELETE FROM albums WHERE artist_id = $1", [
        numericId,
      ]);

      // Delete the artist
      const result = await client.query(
        "DELETE FROM artists WHERE artist_id = $1 RETURNING *",
        [numericId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Artist not found" });
      }

      await client.query("COMMIT");
      return res.json({
        message: "Artist and all related records deleted successfully",
        deletedAlbums: albumCount,
        deletedOrderItems: deletedOrderItems,
      });
    }

    // Option 2: Safe delete (default) - reassign albums to fallback artist
    if (albumCount > 0) {
      // Move all albums to the fallback artist (ID 0) so the delete can proceed
      await client.query("UPDATE albums SET artist_id = 0 WHERE artist_id = $1", [
        numericId,
      ]);
      reassignedAlbums = albumCount;
    }

    // Delete the artist
    const result = await client.query(
      "DELETE FROM artists WHERE artist_id = $1 RETURNING *",
      [numericId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Artist not found" });
    }

    await client.query("COMMIT");
    res.json({
      message: "Artist deleted successfully",
      reassignedAlbums,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete artist error:", err);
    res.status(500).json({ error: "Failed to delete artist: " + err.message });
  } finally {
    client.release();
  }
});

// COMPANIES CRUD
app.get("/api/admin/companies", async (req, res) => {
  try {
    const result = await mainDB.query(
      "SELECT * FROM companies WHERE company_id != 0 ORDER BY company_id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get companies error:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

app.post("/api/admin/companies", async (req, res) => {
  const validation = validateCompanyPayload(req.body, ACTIONS.create);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const insertCompany = async () => {
    return mainDB.query(
      "INSERT INTO companies (name, headquarters, founded_year, ceo_name) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        validation.name,
        validation.headquarters,
        validation.foundedYear,
        validation.ceoName,
      ]
    );
  };

  try {
    const result = await insertCompany();
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create company error:", err);

    if (err.code === "23505" && err.constraint === "companies_name_key") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "company",
            ACTIONS.create,
            "A company with this name already exists"
          ),
        });
    }

    if (err.code === "23505" && err.constraint === "companies_pkey") {
      try {
        await mainDB.query(
          "SELECT setval('companies_company_id_seq', (SELECT COALESCE(MAX(company_id), 1) FROM companies), true)"
        );
        const retryResult = await insertCompany();
        return res.json(retryResult.rows[0]);
      } catch (seqErr) {
        console.error("Company sequence repair error:", seqErr);
        return res.status(500).json({
          error: formatValidationError(
            "company",
            ACTIONS.create,
            "Database sequence is out of sync. Please contact an administrator."
          ),
        });
      }
    }

    res.status(500).json({ error: "Failed to create company" });
  }
});

app.put("/api/admin/companies/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "company",
          ACTIONS.update,
          "Invalid company ID"
        ),
      });
  }

  const validation = validateCompanyPayload(req.body, ACTIONS.update);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await mainDB.query(
      "UPDATE companies SET name = $1, headquarters = $2, founded_year = $3, ceo_name = $4 WHERE company_id = $5 RETURNING *",
      [
        validation.name,
        validation.headquarters,
        validation.foundedYear,
        validation.ceoName,
        numericId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update company error:", err);
    if (err.code === "23505" && err.constraint === "companies_name_key") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "company",
            ACTIONS.update,
            "A company with this name already exists"
          ),
        });
    }
    res.status(500).json({ error: "Failed to update company" });
  }
});

app.delete("/api/admin/companies/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError(
          "company",
          ACTIONS.delete,
          "Invalid company ID"
        ),
      });
  }
  const { force } = req.query; // force=true for cascade delete
  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // Check if company has any artists
    const artistsCheck = await client.query(
      "SELECT artist_id FROM artists WHERE company_id = $1",
      [numericId]
    );

    const artistCount = artistsCheck.rows.length;

    // Option 1: Force delete with cascade
    if (force === "true" && artistCount > 0) {
      let deletedAlbums = 0;
      let deletedOrderItems = 0;

      // For each artist, delete all related records
      for (const artist of artistsCheck.rows) {
        // Get all albums for this artist
        const albumsCheck = await client.query(
          "SELECT album_id FROM albums WHERE artist_id = $1",
          [artist.artist_id]
        );

        deletedAlbums += albumsCheck.rows.length;

        // For each album, delete related records
        for (const album of albumsCheck.rows) {
          // Delete order items
          const orderItemsResult = await client.query(
            "DELETE FROM order_items WHERE album_id = $1",
            [album.album_id]
          );
          deletedOrderItems += orderItemsResult.rowCount;

          // Delete cart items
          await client.query("DELETE FROM cart_items WHERE album_id = $1", [
            album.album_id,
          ]);
        }

        // Delete all albums for this artist
        await client.query("DELETE FROM albums WHERE artist_id = $1", [
          artist.artist_id,
        ]);
      }

      // Delete all artists
      await client.query("DELETE FROM artists WHERE company_id = $1", [
        numericId,
      ]);

      // Delete the company
      const result = await client.query(
        "DELETE FROM companies WHERE company_id = $1 RETURNING *",
        [numericId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Company not found" });
      }

      await client.query("COMMIT");
      return res.json({
        message: "Company and all related records deleted successfully",
        deletedArtists: artistCount,
        deletedAlbums: deletedAlbums,
        deletedOrderItems: deletedOrderItems,
      });
    }

    // Safe delete 
    if (artistCount > 0) {
      // Update all artists to have company_id = 0 (fallback company)
      await client.query(
        "UPDATE artists SET company_id = 0 WHERE company_id = $1",
        [numericId]
      );
    }

    // Delete the company
    const result = await client.query(
      "DELETE FROM companies WHERE company_id = $1 RETURNING *",
      [numericId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Company not found" });
    }

    await client.query("COMMIT");
    res.json({
      message: "Company deleted successfully",
      artistsReassigned:
        artistCount > 0
          ? `${artistCount} artist(s) reassigned to fallback company (ID: 0)`
          : null,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete company error:", err);
    res.status(500).json({ error: "Failed to delete company: " + err.message });
  } finally {
    client.release();
  }
});

// USERS CRUD
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await mainDB.query(
      "SELECT user_id, username, email, phone, address, role FROM users ORDER BY user_id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/admin/users", async (req, res) => {
  const validation = validateUserPayload(req.body, ACTIONS.create);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const insertUser = async () => {
    const result = await mainDB.query(
      "INSERT INTO users (username, email, password, phone, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, username, email, phone, address, role",
      [
        validation.username,
        validation.email,
        validation.password,
        validation.phone,
        validation.address,
        validation.role,
      ]
    );
    return result.rows[0];
  };

  try {
    const user = await insertUser();
    res.json(user);
  } catch (err) {
    console.error("Create user error:", err);

    if (err.code === "23505" && err.constraint === "users_email_key") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "user",
            ACTIONS.create,
            "Email is already registered"
          ),
        });
    }

    if (err.code === "23505" && err.constraint === "users_pkey") {
      try {
        await mainDB.query(
          "SELECT setval('users_user_id_seq', (SELECT COALESCE(MAX(user_id), 1) FROM users), true)"
        );
        const user = await insertUser();
        return res.json(user);
      } catch (seqErr) {
        console.error("User sequence repair error:", seqErr);
        return res.status(500).json({
          error: formatValidationError(
            "user",
            ACTIONS.create,
            "Database sequence is out of sync. Please contact an administrator."
          ),
        });
      }
    }

    res.status(500).json({ error: "Failed to create user" });
  }
});

app.put("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError("user", ACTIONS.update, "Invalid user ID"),
      });
  }

  const validation = validateUserPayload(req.body, ACTIONS.update);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const result = await mainDB.query(
      "UPDATE users SET username = $1, email = $2, password = $3, phone = $4, address = $5, role = $6 WHERE user_id = $7 RETURNING user_id, username, email, phone, address, role",
      [
        validation.username,
        validation.email,
        validation.password,
        validation.phone,
        validation.address,
        validation.role,
        numericId,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update user error:", err);
    if (err.code === "23505" && err.constraint === "users_email_key") {
      return res
        .status(400)
        .json({
          error: formatValidationError(
            "user",
            ACTIONS.update,
            "Email is already registered"
          ),
        });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const numericId = parseInteger(id);
  if (!numericId) {
    return res
      .status(400)
      .json({
        error: formatValidationError("user", ACTIONS.delete, "Invalid user ID"),
      });
  }
  const { force } = req.query; // force=true for cascade delete
  const client = await mainDB.connect();

  try {
    await client.query("BEGIN");

    // Check if user has any orders
    const ordersCheck = await client.query(
      "SELECT order_id FROM orders WHERE user_id = $1",
      [numericId]
    );

    const orderCount = ordersCheck.rows.length;

    // Option 1: Force delete with cascade
    if (force === "true" && orderCount > 0) {
      let deletedOrderItems = 0;
      let deletedPayments = 0;

      // For each order, delete related records
      for (const order of ordersCheck.rows) {
        // Delete order items
        const orderItemsResult = await client.query(
          "DELETE FROM order_items WHERE order_id = $1",
          [order.order_id]
        );
        deletedOrderItems += orderItemsResult.rowCount;

        // Delete payments
        const paymentsResult = await client.query(
          "DELETE FROM payments WHERE order_id = $1",
          [order.order_id]
        );
        deletedPayments += paymentsResult.rowCount;
      }

      // Delete all orders
      await client.query("DELETE FROM orders WHERE user_id = $1", [numericId]);

      // Delete cart items
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [
        numericId,
      ]);

      // Delete the user
      const result = await client.query(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [numericId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }

      await client.query("COMMIT");
      return res.json({
        message: "User and all related records deleted successfully",
        deletedOrders: orderCount,
        deletedOrderItems: deletedOrderItems,
        deletedPayments: deletedPayments,
      });
    }

    // Safe delete
    if (orderCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Cannot delete user with order history",
        suggestion: "Use ?force=true to delete user and all related orders",
        orderCount: orderCount,
      });
    }

    // Delete cart items first (if any)
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [
      numericId,
    ]);

    // Delete the user
    const result = await client.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [numericId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user: " + err.message });
  } finally {
    client.release();
  }
});

// Check deletion constraints before deleting
app.get("/api/admin/check-delete/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  try {
    let canDelete = true;
    let dependencies = [];
    let message = "";

    if (type === "album") {
      const [orders, carts] = await Promise.all([
        mainDB.query(
          "SELECT COUNT(*) as count FROM order_items WHERE album_id = $1",
          [id]
        ),
        mainDB.query(
          "SELECT COUNT(*) as count FROM cart_items WHERE album_id = $1",
          [id]
        ),
      ]);

      const orderCount = parseInt(orders.rows[0].count);
      const cartCount = parseInt(carts.rows[0].count);

      if (orderCount > 0) {
        canDelete = false;
        dependencies.push(`${orderCount} order(s)`);
      }
      if (cartCount > 0) {
        dependencies.push(`${cartCount} cart item(s) (will be removed)`);
      }

      message = canDelete
        ? cartCount > 0
          ? "Album can be deleted. Cart items will be removed automatically."
          : "Album can be deleted safely."
        : `Cannot delete: Album has ${orderCount} associated order(s).`;
    } else if (type === "artist") {
      const albums = await mainDB.query(
        "SELECT COUNT(*) as count FROM albums WHERE artist_id = $1",
        [id]
      );
      const albumCount = parseInt(albums.rows[0].count);

      if (albumCount > 0) {
        canDelete = false;
        dependencies.push(`${albumCount} album(s)`);
        message = `Cannot delete: Artist has ${albumCount} album(s). Delete or reassign albums first.`;
      } else {
        message = "Artist can be deleted safely.";
      }
    } else if (type === "company") {
      const artists = await mainDB.query(
        "SELECT COUNT(*) as count FROM artists WHERE company_id = $1",
        [id]
      );
      const artistCount = parseInt(artists.rows[0].count);

      if (artistCount > 0) {
        dependencies.push(
          `${artistCount} artist(s) (will be reassigned to fallback company)`
        );
        message = `Company can be deleted. ${artistCount} artist(s) will be reassigned to fallback company (ID: 0).`;
      } else {
        message = "Company can be deleted safely.";
      }
      // Companies can always be deleted (artists will be reassigned)
      canDelete = true;
    } else if (type === "user") {
      const [orders, carts] = await Promise.all([
        mainDB.query(
          "SELECT COUNT(*) as count FROM orders WHERE user_id = $1",
          [id]
        ),
        mainDB.query(
          "SELECT COUNT(*) as count FROM cart_items WHERE user_id = $1",
          [id]
        ),
      ]);

      const orderCount = parseInt(orders.rows[0].count);
      const cartCount = parseInt(carts.rows[0].count);

      if (orderCount > 0) {
        canDelete = false;
        dependencies.push(`${orderCount} order(s)`);
      }
      if (cartCount > 0) {
        dependencies.push(`${cartCount} cart item(s) (will be removed)`);
      }

      message = canDelete
        ? cartCount > 0
          ? "User can be deleted. Cart items will be removed automatically."
          : "User can be deleted safely."
        : `Cannot delete: User has ${orderCount} order(s) in history.`;
    }

    res.json({ canDelete, dependencies, message });
  } catch (err) {
    console.error("Check delete error:", err);
    res.status(500).json({ error: "Failed to check deletion constraints" });
  }
});

// ========== END ADMIN CRUD ENDPOINTS ==========

// ========================================
// ========== OLAP REPORTS ENDPOINTS ==========
// ========================================

// ROLL UP: Sales aggregated by Company → Artist → Album (hierarchical)
// Uses denormalized tables: company_sales_report, album_sales_report, sales_fact
app.get("/api/reports/rollup-sales", async (req, res) => {
  const { level } = req.query; // 'company', 'artist', or 'album'

  try {
    let query = "";

    if (level === "company") {
      // Roll up to company level - use denormalized company_sales_report
      query = `
        SELECT 
          company_name,
          total_orders,
          albums_sold as total_units_sold,
          total_sales as total_revenue
        FROM company_sales_report
        ORDER BY total_sales DESC
      `;
    } else if (level === "artist") {
      // Roll up to artist level - use sales_fact for flexibility
      query = `
        SELECT 
          company_name,
          artist_name,
          COUNT(DISTINCT order_id) as total_orders,
          SUM(quantity) as total_units_sold,
          SUM(total_amount) as total_revenue
        FROM sales_fact
        WHERE order_status = ANY($1)
        GROUP BY company_name, artist_name
        ORDER BY total_revenue DESC
      `;
    } else {
      // Most detailed level (album) - use denormalized album_sales_report
      query = `
        SELECT 
          company_name,
          artist_name,
          album_name as album_title,
          sales_count as total_orders,
          sales_count as total_units_sold,
          total_revenue
        FROM album_sales_report
        ORDER BY total_revenue DESC
      `;
    }

    const result = level === "company" || level === "album" 
      ? await reportsDB.query(query)
      : await reportsDB.query(query, [ANALYTICS_STATUSES]);
    res.json(result.rows);
  } catch (err) {
    console.error("Roll up error:", err);
    res.status(500).json({ error: "Failed to fetch rollup report" });
  }
});

// DRILL DOWN: Start from summary and drill into details
// Uses denormalized sales_fact table
app.get("/api/reports/drilldown/:type/:id", async (req, res) => {
  const { type, id } = req.params; // type: 'company' or 'artist', id: entity id

  try {
    let query = "";

    if (type === "company") {
      // Drill down from company to see all artists - use sales_fact
      query = `
        SELECT 
          artist_id,
          artist_name,
          COUNT(DISTINCT order_id) as total_orders,
          SUM(quantity) as total_units_sold,
          SUM(total_amount) as total_revenue
        FROM sales_fact
        WHERE company_id = $1 AND order_status = ANY($2)
        GROUP BY artist_id, artist_name
        ORDER BY total_revenue DESC
      `;
    } else if (type === "artist") {
      // Drill down from artist to see all albums - use sales_fact
      query = `
        SELECT 
          album_id,
          album_title,
          COUNT(DISTINCT order_id) as total_orders,
          SUM(quantity) as total_units_sold,
          SUM(total_amount) as total_revenue,
          AVG(price) as price
        FROM sales_fact
        WHERE artist_id = $1 AND order_status = ANY($2)
        GROUP BY album_id, album_title, price
        ORDER BY total_revenue DESC
      `;
    }

    const result = await reportsDB.query(query, [id, ANALYTICS_STATUSES]);
    res.json(result.rows);
  } catch (err) {
    console.error("Drill down error:", err);
    res.status(500).json({ error: "Failed to fetch drilldown report" });
  }
});

// DICE: Multi-dimensional filtering (Date Range + Status + Price Range)
// Uses denormalized sales_fact table
app.get("/api/reports/dice", async (req, res) => {
  const {
    startDate,
    endDate,
    status,
    minPrice,
    maxPrice,
    companyId,
    artistId,
    albumKey,
  } = req.query;

  try {
    let whereConditions = [`order_status = ANY($1)`];
    let params = [ANALYTICS_STATUSES];
    let paramIndex = 2;

    if (startDate) {
      whereConditions.push(`order_date >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`order_date <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    if (status && status !== "ALL") {
      whereConditions.push(`order_status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const companyIdInt = parseInteger(companyId);
    if (companyIdInt) {
      whereConditions.push(`company_id = $${paramIndex}`);
      params.push(companyIdInt);
      paramIndex++;
    }

    const artistIdInt = parseInteger(artistId);
    if (artistIdInt) {
      whereConditions.push(`artist_id = $${paramIndex}`);
      params.push(artistIdInt);
      paramIndex++;
    }

    if (albumKey) {
      const [albumArtistPart, normalizedTitlePart] = albumKey.split("::");
      const parsedArtist = parseInteger(albumArtistPart);
      if (parsedArtist && normalizedTitlePart) {
        if (!artistIdInt) {
          whereConditions.push(`artist_id = $${paramIndex}`);
          params.push(parsedArtist);
          paramIndex++;
        }
        whereConditions.push(
          `LOWER(TRIM(split_part(album_title, '-', 1))) = $${paramIndex}`
        );
        params.push(normalizedTitlePart);
        paramIndex++;
      }
    }

    if (minPrice) {
      whereConditions.push(`price >= $${paramIndex}`);
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`price <= $${paramIndex}`);
      params.push(maxPrice);
      paramIndex++;
    }

    const query = `
      SELECT 
        order_id,
        order_date,
        order_status as status,
        username,
        email,
        album_title,
        artist_name,
        company_name,
        quantity,
        price,
        total_amount
      FROM sales_fact
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY order_date DESC
      LIMIT 100
    `;

    const result = await reportsDB.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Dice error:", err);
    res.status(500).json({ error: "Failed to fetch dice report" });
  }
});

app.get("/api/reports/dice/filters", async (_req, res) => {
  try {
    const [companies, artists, albums] = await Promise.all([
      reportsDB.query(
        "SELECT DISTINCT company_id, company_name as name FROM sales_fact ORDER BY name ASC"
      ),
      reportsDB.query(
        "SELECT DISTINCT artist_id, company_id, artist_name as name FROM sales_fact ORDER BY name ASC"
      ),
      reportsDB.query(
        `
          SELECT DISTINCT ON (artist_id, LOWER(TRIM(split_part(album_title, '-', 1))))
            CONCAT(artist_id, '::', LOWER(TRIM(split_part(album_title, '-', 1)))) AS album_key,
            TRIM(split_part(album_title, '-', 1)) AS base_title,
            artist_id,
            artist_name,
            company_id
          FROM sales_fact
          ORDER BY artist_id, LOWER(TRIM(split_part(album_title, '-', 1))), album_id ASC
        `
      ),
    ]);

    res.json({
      companies: companies.rows,
      artists: artists.rows,
      albums: albums.rows,
    });
  } catch (err) {
    console.error("Dice filters error:", err);
    res.status(500).json({ error: "Failed to load dice filters" });
  }
});

app.post("/api/reports/refresh", async (_req, res) => {
  try {
    await syncReportsDatabase();
    res.json({ message: "Reports database refreshed" });
  } catch (err) {
    console.error("Refresh reports error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to refresh reports database" });
  }
});

// SLICE: Single dimension filtering (e.g., sales for specific time period)
app.get("/api/reports/slice/:dimension", async (req, res) => {
  const { dimension } = req.params;
  const { value } = req.query;

  try {
    if (dimension === "time") {
      // Use sales_fact for daily/yearly, monthly_sales_report for monthly
      const [daily, monthly, yearly] = await Promise.all([
        reportsDB.query(
          `
            SELECT 
              DATE_TRUNC('day', order_date)::date AS date,
              COUNT(DISTINCT order_id) AS total_orders,
              COALESCE(SUM(total_amount), 0) AS total_revenue,
              CASE WHEN COUNT(DISTINCT order_id) = 0 
                THEN 0 
                ELSE SUM(total_amount) / COUNT(DISTINCT order_id) 
              END AS avg_order_value
            FROM sales_fact
            WHERE order_status = ANY($1)
              AND order_date >= NOW() - INTERVAL '30 days'
            GROUP BY date
            ORDER BY date DESC
          `,
          [ANALYTICS_STATUSES]
        ),
        reportsDB.query(
          `
            SELECT 
              TO_CHAR(month, 'YYYY Mon') AS label,
              CONCAT('Q', CEIL(EXTRACT(MONTH FROM month)/3)::INT, ' ', EXTRACT(YEAR FROM month)::INT) AS quarter,
              total_orders,
              total_revenue,
              avg_order_value
            FROM monthly_sales_report
            WHERE month >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
            ORDER BY month DESC
          `
        ),
        reportsDB.query(
          `
            SELECT 
              TO_CHAR(DATE_TRUNC('year', order_date), 'YYYY') AS label,
              COUNT(DISTINCT order_id) AS total_orders,
              COALESCE(SUM(total_amount), 0) AS total_revenue,
              CASE WHEN COUNT(DISTINCT order_id) = 0 
                THEN 0 
                ELSE SUM(total_amount) / COUNT(DISTINCT order_id) 
              END AS avg_order_value
            FROM sales_fact
            WHERE order_status = ANY($1)
              AND order_date >= DATE_TRUNC('year', NOW()) - INTERVAL '4 years'
            GROUP BY DATE_TRUNC('year', order_date), label
            ORDER BY DATE_TRUNC('year', order_date) DESC
          `,
          [ANALYTICS_STATUSES]
        ),
      ]);

      return res.json({
        daily: daily.rows,
        monthly: monthly.rows,
        yearly: yearly.rows,
      });
    }

    let query = "";
    let params = [];

    if (dimension === "status") {
      // Use sales_fact for status dimension
      query = `
        SELECT 
          order_status as status,
          COUNT(DISTINCT order_id) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value
        FROM sales_fact
        ${value ? `WHERE order_status = $1` : ""}
        GROUP BY order_status
        ORDER BY total_orders DESC
      `;
      if (value) params.push(value);
    } else if (dimension === "company") {
      // Use denormalized company_sales_report or sales_fact
      if (value) {
        query = `
          SELECT 
            company_id,
            company_name,
            COUNT(DISTINCT order_id) as total_orders,
            SUM(total_amount) as total_revenue,
            CASE 
              WHEN COUNT(DISTINCT order_id) = 0 THEN 0
              ELSE SUM(total_amount) / COUNT(DISTINCT order_id)
            END as avg_order_value
          FROM sales_fact
          WHERE order_status = ANY($1) AND company_id = $2
          GROUP BY company_id, company_name
          ORDER BY total_revenue DESC
        `;
        params = [ANALYTICS_STATUSES, value];
      } else {
        query = `
          SELECT 
            company_name,
            total_orders,
            total_sales as total_revenue,
            CASE 
              WHEN total_orders = 0 THEN 0
              ELSE total_sales / total_orders
            END as avg_order_value
          FROM company_sales_report
          ORDER BY total_sales DESC
        `;
      }
    } else if (dimension === "artist") {
      // Use sales_fact for artist dimension
      query = `
        SELECT 
          artist_id,
          artist_name,
          COUNT(DISTINCT order_id) as total_orders,
          SUM(total_amount) as total_revenue,
          CASE 
            WHEN COUNT(DISTINCT order_id) = 0 THEN 0
            ELSE SUM(total_amount) / COUNT(DISTINCT order_id)
          END as avg_order_value
        FROM sales_fact
        WHERE order_status = ANY($1)
          ${value ? `AND artist_id = $2` : ""}
        GROUP BY artist_id, artist_name
        ORDER BY total_revenue DESC
      `;
      params = value ? [ANALYTICS_STATUSES, value] : [ANALYTICS_STATUSES];
    } else {
      return res.status(400).json({ error: "Invalid slice dimension" });
    }

    const result = await reportsDB.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Slice error:", err);
    res.status(500).json({ error: "Failed to fetch slice report" });
  }
});

// Additional: Sales trends over time
// Uses denormalized sales_fact table and monthly_sales_report
app.get("/api/reports/sales-trends", async (req, res) => {
  const granularity = (req.query.granularity || "daily").toLowerCase();

  try {
    let query = "";
    let params = [ANALYTICS_STATUSES];

    if (granularity === "daily") {
      query = `
        SELECT 
          DATE_TRUNC('day', order_date)::date as date,
          COUNT(DISTINCT order_id) as orders,
          SUM(total_amount) as revenue
        FROM sales_fact
        WHERE order_status = ANY($1)
          AND order_date >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', order_date)
        ORDER BY DATE_TRUNC('day', order_date)
      `;
    } else if (granularity === "monthly") {
      query = `
        SELECT 
          TO_CHAR(month, 'YYYY Mon') as period,
          CONCAT('Q', CEIL(EXTRACT(MONTH FROM month)/3)::INT, ' ', EXTRACT(YEAR FROM month)::INT) AS quarter,
          total_orders as orders,
          total_revenue as revenue,
          'month' as type
        FROM monthly_sales_report
        WHERE month >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
        ORDER BY month
      `;
      params = [];
    } else if (granularity === "quarterly") {
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('quarter', order_date), '"Q"Q YYYY') as period,
          COUNT(DISTINCT order_id) as orders,
          SUM(total_amount) as revenue,
          'quarter' as type
        FROM sales_fact
        WHERE order_status = ANY($1)
          AND order_date >= DATE_TRUNC('quarter', NOW()) - INTERVAL '21 months'
        GROUP BY DATE_TRUNC('quarter', order_date), period
        ORDER BY DATE_TRUNC('quarter', order_date)
      `;
    } else {
      query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('year', order_date), 'YYYY') as period,
          COUNT(DISTINCT order_id) as orders,
          SUM(total_amount) as revenue,
          'year' as type
        FROM sales_fact
        WHERE order_status = ANY($1)
          AND order_date >= DATE_TRUNC('year', NOW()) - INTERVAL '4 years'
        GROUP BY DATE_TRUNC('year', order_date), period
        ORDER BY DATE_TRUNC('year', order_date)
      `;
    }

    const result = await reportsDB.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Sales trends error:", err);
    res.status(500).json({ error: "Failed to fetch sales trends" });
  }
});

// Get dimension values for filters
app.get("/api/reports/dimensions", async (req, res) => {
  try {
    const [companies, artists, statuses] = await Promise.all([
      mainDB.query("SELECT company_id, name FROM companies ORDER BY name"),
      mainDB.query("SELECT artist_id, name FROM artists ORDER BY name"),
      mainDB.query("SELECT DISTINCT status FROM orders ORDER BY status"),
    ]);

    res.json({
      companies: companies.rows,
      artists: artists.rows,
      statuses: statuses.rows.map((r) => r.status),
    });
  } catch (err) {
    console.error("Dimensions error:", err);
    res.status(500).json({ error: "Failed to fetch dimensions" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
