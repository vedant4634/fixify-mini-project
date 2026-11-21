const mysql = require('mysql2/promise');

const CATEGORY_IMAGES = {
  'ac-repair': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  'appliance-repair': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80',
  'carpenter': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  'mechanic': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  'painter': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  'plumber': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
};

async function updateCategoryImages() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
  });

  for (const db of ['mpfixfy', 'mpfxify', 'fixify_db']) {
    try {
      await conn.changeUser({ database: db });
      
      // Check if image column exists
      const [cols] = await conn.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'image'
      `, [db]);

      if (cols.length === 0) {
        await conn.query(`ALTER TABLE categories ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER icon;`);
        console.log(`✅ [${db}] Added 'image' column to categories table.`);
      } else {
        console.log(`ℹ️ [${db}] 'image' column already exists in categories table.`);
      }

      // Update image URLs
      for (const [id, url] of Object.entries(CATEGORY_IMAGES)) {
        await conn.query(`UPDATE categories SET image = ? WHERE id = ?`, [url, id]);
      }
      console.log(`✅ [${db}] Updated images for all 8 categories.`);
    } catch (err) {
      console.error(`❌ [${db}] Error updating categories:`, err.message);
    }
  }

  await conn.end();
}

updateCategoryImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
