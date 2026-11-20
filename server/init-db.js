/**
 * Fixify Database Initialization & Verification Script
 * Connects to local MySQL (XAMPP at 127.0.0.1:3306),
 * creates fixify_db if not exists, executes schema, and verifies
 * tables, primary keys, foreign keys, and connectivity.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
};

const DB_NAME = process.env.DB_NAME || 'fixify_db';

const EXPECTED_TABLES = [
  'users',
  'categories',
  'providers',
  'services',
  'reviews',
  'bookings',
  'saved_providers',
];

// DDL for all seven tables using CREATE TABLE IF NOT EXISTS
const TABLE_DEFINITIONS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(30) DEFAULT NULL,
      avatar VARCHAR(500) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      short_name VARCHAR(50) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      description TEXT,
      starting_price INT NOT NULL DEFAULT 199,
      popular_services JSON DEFAULT NULL,
      badge VARCHAR(60) DEFAULT NULL,
      accent_color VARCHAR(150) DEFAULT NULL,
      border_color VARCHAR(150) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  providers: `
    CREATE TABLE IF NOT EXISTS providers (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      business_name VARCHAR(150) NOT NULL,
      category_id VARCHAR(50) NOT NULL,
      category_name VARCHAR(100) NOT NULL,
      photo VARCHAR(500) NOT NULL,
      cover_photo VARCHAR(500) DEFAULT NULL,
      rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
      review_count INT NOT NULL DEFAULT 0,
      starting_price INT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT TRUE,
      available BOOLEAN NOT NULL DEFAULT TRUE,
      experience VARCHAR(50) NOT NULL DEFAULT '3+ yrs',
      jobs_completed INT NOT NULL DEFAULT 0,
      response_time VARCHAR(50) NOT NULL DEFAULT '< 15 mins',
      city VARCHAR(80) NOT NULL,
      area VARCHAR(120) NOT NULL,
      lat DECIMAL(10, 7) NOT NULL,
      lng DECIMAL(10, 7) NOT NULL,
      address TEXT NOT NULL,
      about TEXT NOT NULL,
      badges JSON DEFAULT NULL,
      gallery JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_providers_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_providers_category (category_id),
      INDEX idx_providers_city (city),
      INDEX idx_providers_coords (lat, lng),
      INDEX idx_providers_price (starting_price),
      INDEX idx_providers_rating (rating),
      INDEX idx_providers_verified (verified),
      INDEX idx_providers_available (available)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  services: `
    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(50) PRIMARY KEY,
      provider_id VARCHAR(50) NOT NULL,
      name VARCHAR(150) NOT NULL,
      price INT NOT NULL,
      duration VARCHAR(60) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_services_provider FOREIGN KEY (provider_id)
        REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_services_provider (provider_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(50) PRIMARY KEY,
      provider_id VARCHAR(50) NOT NULL,
      user_id INT DEFAULT NULL,
      author VARCHAR(120) NOT NULL,
      rating DECIMAL(2, 1) NOT NULL,
      date VARCHAR(60) DEFAULT 'Just now',
      comment TEXT NOT NULL,
      helpful INT NOT NULL DEFAULT 0,
      verified_customer BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_reviews_provider FOREIGN KEY (provider_id)
        REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_reviews_provider (provider_id),
      INDEX idx_reviews_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  bookings: `
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      user_id INT DEFAULT NULL,
      provider_id VARCHAR(50) NOT NULL,
      provider_name VARCHAR(120) NOT NULL,
      business_name VARCHAR(150) DEFAULT NULL,
      category_name VARCHAR(100) DEFAULT NULL,
      provider_photo VARCHAR(500) DEFAULT NULL,
      service_name VARCHAR(150) NOT NULL,
      date VARCHAR(30) NOT NULL,
      time_slot VARCHAR(60) NOT NULL,
      status ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
      cancel_reason TEXT DEFAULT NULL,
      address TEXT NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      customer_phone VARCHAR(30) NOT NULL,
      notes TEXT DEFAULT NULL,
      price INT NOT NULL,
      taxes INT NOT NULL DEFAULT 0,
      platform_fee INT NOT NULL DEFAULT 49,
      total_amount INT NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      is_rated BOOLEAN NOT NULL DEFAULT FALSE,
      user_rating DECIMAL(2, 1) DEFAULT NULL,
      user_review TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id)
        REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_bookings_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_bookings_user (user_id),
      INDEX idx_bookings_provider (provider_id),
      INDEX idx_bookings_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  saved_providers: `
    CREATE TABLE IF NOT EXISTS saved_providers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      provider_id VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_saved_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_saved_provider FOREIGN KEY (provider_id)
        REFERENCES providers(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT uq_user_provider UNIQUE (user_id, provider_id),
      INDEX idx_saved_user (user_id),
      INDEX idx_saved_provider (provider_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
};

async function main() {
  console.log('====================================================');
  console.log('🔧 Fixify Database Auto-Setup & Verification');
  console.log(`Connecting to MySQL Server at ${config.host}:${config.port} (user: ${config.user})...`);
  console.log('====================================================\n');

  let connection;

  // 1. Initial connection to MySQL server
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });
    console.log(`✅ [1/6] Successfully connected to MySQL server at ${config.host}:${config.port}`);
  } catch (err) {
    console.error(`❌ [CONNECTION FAILED] Could not reach MySQL at ${config.host}:${config.port}`);
    console.error(`   Error code: ${err.code}`);
    console.error(`   Message:    ${err.message}`);
    if (err.code === 'ECONNREFUSED' || err.code === 'EACCES') {
      console.error('\n🔍 Diagnosis:');
      console.error('   1. Please confirm XAMPP is running and the "MySQL" module has the Green "Running" indicator.');
      console.error('   2. Verify MySQL port is 3306 (or check XAMPP control panel for the configured port).');
      console.error('   3. If XAMPP password is set for root, update DB_PASSWORD in server/.env.');
    }
    process.exit(1);
  }

  try {
    // 2. Test connection with SELECT 1
    const [testRow] = await connection.query('SELECT 1 AS connection_test');
    console.log(`✅ [2/6] Ping test executed: SELECT 1 => ${testRow[0].connection_test}`);

    // 3. Create database if it does not already exist
    console.log(`\nChecking database "${DB_NAME}"...`);
    const [dbCheck] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [DB_NAME]
    );

    if (dbCheck.length === 0) {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      console.log(`✨ [3/6] Database "${DB_NAME}" did not exist and was CREATED successfully.`);
    } else {
      console.log(`ℹ️ [3/6] Database "${DB_NAME}" already exists (preserved, not overwritten).`);
    }

    // Switch to fixify_db
    await connection.changeUser({ database: DB_NAME });

    // 4. Check existing tables
    const [existingTablesRaw] = await connection.query('SHOW TABLES');
    const existingTableNames = existingTablesRaw.map((r) => Object.values(r)[0]);
    console.log(`Existing tables before setup:`, existingTableNames.length ? existingTableNames : '(none)');

    // 5. Create each table in dependency order using CREATE TABLE IF NOT EXISTS
    console.log('\nCreating missing tables in foreign-key dependency order...');
    const createdTables = [];
    const preservedTables = [];

    for (const tableName of EXPECTED_TABLES) {
      if (existingTableNames.includes(tableName)) {
        preservedTables.push(tableName);
        console.log(`  - Table "${tableName}" already exists. Inspected and preserved.`);
      } else {
        await connection.query(TABLE_DEFINITIONS[tableName]);
        createdTables.push(tableName);
        console.log(`  + Table "${tableName}" created successfully.`);
      }
    }

    // 6. Verify all 7 tables exist
    console.log('\nVerifying table presence and structure...');
    const [currentTablesRaw] = await connection.query('SHOW TABLES');
    const currentTableNames = currentTablesRaw.map((r) => Object.values(r)[0]);

    const missingTables = EXPECTED_TABLES.filter((t) => !currentTableNames.includes(t));
    if (missingTables.length > 0) {
      throw new Error(`Tables missing after creation: ${missingTables.join(', ')}`);
    }
    console.log(`✅ [4/6] All 7 expected tables are confirmed present:`);
    currentTableNames.forEach((t) => console.log(`   ✓ ${t}`));

    // 7. Inspect Primary Keys, Foreign Keys and Column counts for each table
    console.log('\nInspecting schema relationships, primary keys and foreign keys:');
    const schemaReport = {};

    for (const tableName of EXPECTED_TABLES) {
      // Columns
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [DB_NAME, tableName]
      );

      // Primary Key
      const [pkRows] = await connection.query(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'`,
        [DB_NAME, tableName]
      );

      // Foreign Keys
      const [fkRows] = await connection.query(
        `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [DB_NAME, tableName]
      );

      // Row count
      const [[countRow]] = await connection.query(`SELECT COUNT(*) AS total FROM \`${tableName}\``);

      schemaReport[tableName] = {
        columnsCount: columns.length,
        primaryKey: pkRows.map((p) => p.COLUMN_NAME).join(', ') || 'NONE',
        foreignKeys: fkRows.map((f) => `${f.COLUMN_NAME} -> ${f.REFERENCED_TABLE_NAME}(${f.REFERENCED_COLUMN_NAME})`),
        rowCount: countRow.total,
      };

      console.log(`\n  Table [${tableName}]:`);
      console.log(`    • Total Columns: ${schemaReport[tableName].columnsCount}`);
      console.log(`    • Primary Key:   ${schemaReport[tableName].primaryKey}`);
      console.log(`    • Foreign Keys:  ${schemaReport[tableName].foreignKeys.length ? schemaReport[tableName].foreignKeys.join(', ') : 'None'}`);
      console.log(`    • Current Rows:  ${schemaReport[tableName].rowCount}`);
    }

    console.log(`\n✅ [5/6] Schema validation complete. Primary and foreign key constraints verified.`);

    // 8. Test pool connectivity using server/config/db.js
    console.log('\nTesting application pool connection via server/config/db.js...');
    const pool = require('./config/db');
    const [poolTest] = await pool.query('SELECT 1 AS pool_test, NOW() AS server_time');
    console.log(`✅ [6/6] Application pool verified: SELECT 1 => ${poolTest[0].pool_test}, MySQL time: ${poolTest[0].server_time}`);

    console.log('\n====================================================');
    console.log('🎉 Fixify Database Setup & Verification SUCCESSFUL');
    console.log(`Database:     ${DB_NAME}`);
    console.log(`Host:         ${config.host}:${config.port}`);
    console.log(`New Tables:   ${createdTables.length ? createdTables.join(', ') : '(all already existed)'}`);
    console.log(`Preserved:    ${preservedTables.join(', ')}`);
    console.log('====================================================\n');

    await connection.end();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error(`💥 [Error during database setup]:`, err);
    if (connection) await connection.end().catch(() => {});
    process.exit(1);
  }
}

main();
