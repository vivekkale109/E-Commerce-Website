const mysql = require("mysql2/promise");

let pool;

const connectDb = async () => {
  const {
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_PORT
  } = process.env;

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
    throw new Error("MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE must be set");
  }

  pool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD || "",
    database: MYSQL_DATABASE,
    port: Number(MYSQL_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query("SELECT 1");
  await initSchema();
};

const ensureColumn = async ({ table, column, definition }) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.MYSQL_DATABASE, table, column]
  );
  if (rows[0].count === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

const initSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      is_admin TINYINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(120) NOT NULL,
      images JSON NOT NULL,
      stock INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(40) DEFAULT 'processing',
      payment_intent_id VARCHAR(120) NOT NULL,
      shipping_full_name VARCHAR(200),
      shipping_address1 VARCHAR(200),
      shipping_address2 VARCHAR(200),
      shipping_city VARCHAR(120),
      shipping_state VARCHAR(120),
      shipping_postal_code VARCHAR(40),
      shipping_country VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      name VARCHAR(200) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      PRIMARY KEY (order_id, product_id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  await ensureColumn({ table: "users", column: "is_admin", definition: "TINYINT DEFAULT 0" });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_review (product_id, user_id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
};

const getDb = () => {
  if (!pool) {
    throw new Error("Database not initialized");
  }
  return pool;
};

module.exports = { connectDb, getDb };
