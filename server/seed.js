/**
 * Fixify Database Initialization & Seeding Script
 * Run with: npm run seed  (or: node seed.js)
 * Executes schema.sql followed by seed.sql using mysql2.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runSeed() {
  console.log('🔄 Initializing Fixify MySQL Database...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  let connection;

  try {
    // 1. Connect to MySQL server (without selecting database yet)
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    // 2. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Executing schema.sql (creating database & tables)...');
    await connection.query(schemaSql);
    console.log('✅ Tables created successfully!');

    // 3. Read and execute seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Executing seed.sql (inserting providers, services, reviews)...');
    await connection.query(seedSql);
    console.log('✅ Database seeded successfully with 31+ authentic technicians!');

    // 4. Verification queries
    const targetDb = process.env.DB_NAME || 'mpfixfy';
    const [providersCount] = await connection.query(`SELECT COUNT(*) as count FROM \`${targetDb}\`.providers`);
    const [servicesCount] = await connection.query(`SELECT COUNT(*) as count FROM \`${targetDb}\`.services`);
    const [reviewsCount] = await connection.query(`SELECT COUNT(*) as count FROM \`${targetDb}\`.reviews`);
    const [usersCount] = await connection.query(`SELECT COUNT(*) as count FROM \`${targetDb}\`.users`);

    console.log('\n📊 Database Status Summary:');
    console.log(`   - Users:     ${usersCount[0].count}`);
    console.log(`   - Providers: ${providersCount[0].count}`);
    console.log(`   - Services:  ${servicesCount[0].count}`);
    console.log(`   - Reviews:   ${reviewsCount[0].count}`);
    console.log('\n🎉 Fixify database is ready to power the backend!\n');

  } catch (err) {
    console.error('\n❌ Database initialization failed:');
    console.error(err.message);
    console.error('\n💡 Troubleshooting Tips:');
    console.error('1. Make sure your MySQL server is running (e.g. XAMPP, WampServer, or MySQL service).');
    console.error('2. Verify credentials in server/.env (DB_HOST, DB_USER, DB_PASSWORD, DB_PORT).');
    console.error('3. You can also manually import schema.sql and seed.sql using phpMyAdmin or MySQL Workbench.\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeed();

