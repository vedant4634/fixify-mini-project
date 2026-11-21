const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function backup() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const dumpDatabase = async (dbName, filename) => {
    console.log(`\n📦 Backing up database [${dbName}]...`);
    await conn.changeUser({ database: dbName });

    let dumpContent = `-- Fixify Database Backup for [${dbName}]\n`;
    dumpContent += `-- Generated: ${new Date().toISOString()}\n\n`;
    dumpContent += `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;\n`;
    dumpContent += `USE \`${dbName}\`;\n\n`;
    dumpContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    const [tables] = await conn.query('SHOW TABLES');
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [[createTable]] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
      dumpContent += `-- Table: ${tableName}\n`;
      dumpContent += `${createTable['Create Table']};\n\n`;

      const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        dumpContent += `-- Data for ${tableName} (${rows.length} rows)\n`;
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
          }).join(', ');
          dumpContent += `INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`;
        }
        dumpContent += `\n`;
      }
    }

    dumpContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    const filepath = path.join(backupDir, filename);
    fs.writeFileSync(filepath, dumpContent, 'utf8');
    console.log(`✅ Saved backup to: ${filepath} (${(fs.statSync(filepath).size / 1024).toFixed(1)} KB)`);
  };

  await dumpDatabase('fixify_db', `fixify_db_backup_${timestamp}.sql`);
  await dumpDatabase('fixify_db', `fixify_db_backup_latest.sql`);

  // Also backup mpfxify if it has any tables
  await dumpDatabase('mpfxify', `mpfxify_backup_${timestamp}.sql`);
  await dumpDatabase('mpfxify', `mpfxify_backup_latest.sql`);

  await conn.end();
  console.log('\n🛡️ Safety Requirement Complete: Both databases backed up successfully.');
}

backup().catch(err => {
  console.error('Backup error:', err);
  process.exit(1);
});
