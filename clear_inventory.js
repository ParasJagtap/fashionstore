require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function backupAndClearInventory() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'data');
    const backupFilePath = path.join(backupDir, `products_backup_${timestamp}.json`);
    const localJsonPath = path.join(backupDir, 'products.json');

    console.log(`Starting inventory backup & cleanup process at ${new Date().toISOString()}...`);

    let dbRows = [];
    let pool;

    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            console.log('Connecting to database...');
            const res = await pool.query('SELECT * FROM products ORDER BY id DESC');
            dbRows = res.rows;
            console.log(`Fetched ${dbRows.length} product(s) from database.`);
        } catch (dbErr) {
            console.error('Warning: Could not fetch from database:', dbErr.message);
        }
    }

    // Also read local JSON if present
    let localRows = [];
    if (fs.existsSync(localJsonPath)) {
        try {
            localRows = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
            console.log(`Read ${localRows.length} product(s) from local products.json.`);
        } catch (jsonErr) {
            console.error('Warning: Could not read local products.json:', jsonErr.message);
        }
    }

    // Combine or choose best backup data source
    const backupData = {
        backedUpAt: new Date().toISOString(),
        databaseProductsCount: dbRows.length,
        databaseProducts: dbRows,
        localJsonProductsCount: localRows.length,
        localJsonProducts: localRows
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
    console.log(`✅ Backup successfully written to: ${backupFilePath}`);

    // Clear PostgreSQL table
    if (pool) {
        try {
            const deleteRes = await pool.query('DELETE FROM products');
            console.log(`✅ Cleared database 'products' table (${deleteRes.rowCount || 0} rows deleted).`);
        } catch (delErr) {
            console.error('Error clearing database products:', delErr);
        } finally {
            await pool.end();
        }
    }

    // Clear local products.json
    fs.writeFileSync(localJsonPath, JSON.stringify([], null, 2), 'utf8');
    console.log('✅ Local data/products.json reset to empty array [].');
    console.log('Inventory removal completed successfully.');
}

backupAndClearInventory().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
