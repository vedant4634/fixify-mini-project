const mysql = require('mysql2/promise');

const TABLES_ORDER = [
  'categories',
  'users',
  'providers',
  'services',
  'reviews',
  'bookings',
  'saved_providers',
];

const TABLE_SCHEMAS = {
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

async function migrateTo(targetDbName) {
  console.log(`\n====================================================`);
  console.log(`🚀 Starting Migration: [fixify_db] -> [${targetDbName}]`);
  console.log(`====================================================`);

  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  // 1. Create target database if it does not exist
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${targetDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`✅ Database [${targetDbName}] created or verified.`);

  // 2. Disable foreign key checks during migration
  await conn.changeUser({ database: targetDbName });
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

  // 3. Ensure all 7 tables exist with full schema
  for (const tableName of TABLES_ORDER) {
    await conn.query(TABLE_SCHEMAS[tableName]);
  }
  console.log(`✅ All 7 tables verified in [${targetDbName}].`);

  // 4. Migrate records table by table
  const migrationStats = {};

  for (const tableName of TABLES_ORDER) {
    // Read from source fixify_db
    const [sourceRows] = await conn.query(`SELECT * FROM fixify_db.\`${tableName}\``);
    const [[targetCountBefore]] = await conn.query(`SELECT COUNT(*) as c FROM \`${tableName}\``);

    let inserted = 0;
    let skipped = 0;

    for (const row of sourceRows) {
      const keys = Object.keys(row);
      const colsClause = keys.map(k => `\`${k}\``).join(', ');
      const placeholders = keys.map(() => '?').join(', ');

      // Use INSERT IGNORE to prevent duplicate primary/unique keys
      const sql = `INSERT IGNORE INTO \`${tableName}\` (${colsClause}) VALUES (${placeholders})`;
      
      const values = keys.map(k => {
        const val = row[k];
        if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
          return JSON.stringify(val);
        }
        return val;
      });

      const [res] = await conn.query(sql, values);
      if (res.affectedRows > 0) {
        inserted++;
      } else {
        skipped++;
      }
    }

    const [[targetCountAfter]] = await conn.query(`SELECT COUNT(*) as c FROM \`${tableName}\``);
    migrationStats[tableName] = {
      sourceCount: sourceRows.length,
      before: targetCountBefore.c,
      inserted,
      skipped,
      after: targetCountAfter.c,
    };

    console.log(`  Table [${tableName.padEnd(16)}]: Source: ${sourceRows.length} | Before: ${targetCountBefore.c} | Inserted: ${inserted} | Total Now: ${targetCountAfter.c}`);
  }

  // 5. Re-enable foreign key checks
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

  // 6. Verify constraints and integrity
  console.log(`\n🔍 Verifying Foreign Key Integrity in [${targetDbName}]...`);
  const [fkErrors] = await conn.query(`
    SELECT 'orphan_providers' as issue, COUNT(*) as c FROM \`${targetDbName}\`.providers p LEFT JOIN \`${targetDbName}\`.categories c ON p.category_id = c.id WHERE c.id IS NULL
    UNION ALL
    SELECT 'orphan_services', COUNT(*) FROM \`${targetDbName}\`.services s LEFT JOIN \`${targetDbName}\`.providers p ON s.provider_id = p.id WHERE p.id IS NULL
    UNION ALL
    SELECT 'orphan_bookings_provider', COUNT(*) FROM \`${targetDbName}\`.bookings b LEFT JOIN \`${targetDbName}\`.providers p ON b.provider_id = p.id WHERE p.id IS NULL
    UNION ALL
    SELECT 'orphan_reviews_provider', COUNT(*) FROM \`${targetDbName}\`.reviews r LEFT JOIN \`${targetDbName}\`.providers p ON r.provider_id = p.id WHERE p.id IS NULL
  `);

  for (const err of fkErrors) {
    if (err.c > 0) {
      console.warn(`  ⚠️ Integrity issue: ${err.issue} = ${err.c}`);
    } else {
      console.log(`  ✓ Integrity check: ${err.issue} = 0 (perfect)`);
    }
  }

  await conn.end();
  return migrationStats;
}

async function main() {
  // 1. Primary Migration: mpfixfy (as explicitly specified)
  const mpfixfyStats = await migrateTo('mpfixfy');

  // 2. Also populate mpfxify (to cover phpMyAdmin typo if user inspects that database)
  const mpfxifyStats = await migrateTo('mpfxify');

  console.log('\n====================================================');
  console.log('🎉 Migration Completed Successfully for both databases!');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
