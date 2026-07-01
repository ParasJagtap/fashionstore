require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "desc" TEXT,
  price TEXT,
  "collectionType" TEXT,
  "colorFamily" TEXT,
  "priceRange" TEXT,
  pattern TEXT,
  image TEXT
);
`;

async function init() {
  try {
    console.log('Connecting to database...');
    // Create Table
    await pool.query(createTableQuery);
    console.log('Products table verified/created successfully.');

    // Check if products already exist in DB
    const { rows } = await pool.query('SELECT COUNT(*) FROM products');
    const dbCount = parseInt(rows[0].count, 10);

    if (dbCount === 0) {
      console.log('Database table is empty. Checking for local JSON data to migrate...');
      const localJsonPath = path.join(__dirname, 'data', 'products.json');

      if (fs.existsSync(localJsonPath)) {
        const localData = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
        console.log(`Found ${localData.length} local products. Commencing migration...`);

        for (const p of localData) {
          await pool.query(
            `INSERT INTO products (id, title, "desc", price, "collectionType", "colorFamily", "priceRange", pattern, image)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [p.id, p.title, p.desc, p.price, p.collectionType, p.colorFamily, p.priceRange, p.pattern, p.image]
          );
        }
        console.log('Migration completed successfully!');
      } else {
        console.log('No local data file found at data/products.json to migrate.');
      }
    } else {
      console.log(`Products table already contains ${dbCount} items. Skipping initial migration.`);
    }

  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await pool.end();
  }
}

init();
