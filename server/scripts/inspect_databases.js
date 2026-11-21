const mysql = require('mysql2/promise');

async function inspect() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  const [dbs] = await conn.query('SHOW DATABASES');
  console.log('Available databases:', dbs.map(d => d.Database));

  const targetDbs = ['fixify_db', 'mpfxify', 'mpfixfy', 'fixify'];

  for (const db of targetDbs) {
    const exists = dbs.some(d => d.Database === db);
    if (!exists) {
      console.log(`\n=== Database [${db}] does not exist ===`);
      continue;
    }

    console.log(`\n=== Database [${db}] ===`);
    await conn.changeUser({ database: db });
    const [tables] = await conn.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('  (no tables found)');
      continue;
    }
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      try {
        const [[cnt]] = await conn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        console.log(`   Table: ${tableName.padEnd(20)} | Rows: ${cnt.count}`);
      } catch (err) {
        console.log(`   Table: ${tableName.padEnd(20)} | Error counting: ${err.message}`);
      }
    }
  }

  await conn.end();
}

inspect().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
