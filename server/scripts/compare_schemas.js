const mysql = require('mysql2/promise');

async function compareSchemas() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  const getDbSchema = async (dbName) => {
    const result = { tables: {}, foreignKeys: {}, indexes: {} };

    // Columns
    const [cols] = await conn.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [dbName]);

    for (const c of cols) {
      if (!result.tables[c.TABLE_NAME]) {
        result.tables[c.TABLE_NAME] = {};
      }
      result.tables[c.TABLE_NAME][c.COLUMN_NAME] = {
        type: c.COLUMN_TYPE,
        nullable: c.IS_NULLABLE,
        default: c.COLUMN_DEFAULT,
        extra: c.EXTRA,
        key: c.COLUMN_KEY,
      };
    }

    // Foreign Keys
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, CONSTRAINT_NAME, ORDINAL_POSITION
    `, [dbName]);

    for (const fk of fks) {
      if (!result.foreignKeys[fk.TABLE_NAME]) {
        result.foreignKeys[fk.TABLE_NAME] = [];
      }
      result.foreignKeys[fk.TABLE_NAME].push({
        constraint: fk.CONSTRAINT_NAME,
        column: fk.COLUMN_NAME,
        refTable: fk.REFERENCED_TABLE_NAME,
        refColumn: fk.REFERENCED_COLUMN_NAME,
      });
    }

    // Indexes
    const [idxs] = await conn.query(`
      SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, COLUMN_NAME, SEQ_IN_INDEX
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `, [dbName]);

    for (const idx of idxs) {
      if (!result.indexes[idx.TABLE_NAME]) {
        result.indexes[idx.TABLE_NAME] = [];
      }
      result.indexes[idx.TABLE_NAME].push({
        name: idx.INDEX_NAME,
        unique: idx.NON_UNIQUE === 0,
        column: idx.COLUMN_NAME,
      });
    }

    return result;
  };

  const schemaFixifyDb = await getDbSchema('fixify_db');
  const schemaMpfxify = await getDbSchema('mpfxify');

  console.log('=== COMPARISON: fixify_db vs mpfxify ===\n');

  const allTables = Array.from(new Set([
    ...Object.keys(schemaFixifyDb.tables),
    ...Object.keys(schemaMpfxify.tables),
  ]));

  for (const table of allTables) {
    console.log(`\n--- TABLE: [${table}] ---`);
    const inRef = !!schemaFixifyDb.tables[table];
    const inTarget = !!schemaMpfxify.tables[table];

    if (!inRef) {
      console.log(`  Table [${table}] exists in mpfxify but NOT in fixify_db!`);
      continue;
    }
    if (!inTarget) {
      console.log(`  Table [${table}] is MISSING in mpfxify!`);
      continue;
    }

    // Compare columns
    const refCols = schemaFixifyDb.tables[table];
    const targetCols = schemaMpfxify.tables[table];

    const allCols = Array.from(new Set([
      ...Object.keys(refCols),
      ...Object.keys(targetCols),
    ]));

    for (const col of allCols) {
      const cRef = refCols[col];
      const cTarget = targetCols[col];

      if (!cRef) {
        console.log(`  + Column [${col}] extra in mpfxify: ${cTarget.type}`);
      } else if (!cTarget) {
        console.log(`  - Column [${col}] MISSING in mpfxify: expected ${cRef.type}`);
      } else if (cRef.type !== cTarget.type || cRef.nullable !== cTarget.nullable || cRef.key !== cTarget.key) {
        console.log(`  ~ Column [${col}] DIFFERS:`);
        console.log(`      fixify_db: type=${cRef.type}, null=${cRef.nullable}, key=${cRef.key}, extra=${cRef.extra}`);
        console.log(`      mpfxify:   type=${cTarget.type}, null=${cTarget.nullable}, key=${cTarget.key}, extra=${cTarget.extra}`);
      }
    }

    // Compare Foreign keys
    const refFks = schemaFixifyDb.foreignKeys[table] || [];
    const targetFks = schemaMpfxify.foreignKeys[table] || [];
    console.log(`  Foreign Keys: fixify_db has ${refFks.length}, mpfxify has ${targetFks.length}`);
    if (refFks.length !== targetFks.length) {
      console.log('    fixify_db FKs:', JSON.stringify(refFks));
      console.log('    mpfxify FKs:  ', JSON.stringify(targetFks));
    }
  }

  await conn.end();
}

compareSchemas().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
