require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreAbayas() {
    const dataDir = path.join(__dirname, 'data');
    const backupFiles = fs.readdirSync(dataDir)
        .filter(f => f.startsWith('products_backup_') && f.endsWith('.json'))
        .sort()
        .reverse();

    if (backupFiles.length === 0) {
        console.error('No backup file found.');
        process.exit(1);
    }

    const latestBackupPath = path.join(dataDir, backupFiles[0]);
    console.log(`Reading from: ${latestBackupPath}`);
    const backupData = JSON.parse(fs.readFileSync(latestBackupPath, 'utf8'));

    const allSourceProducts = backupData.databaseProducts && backupData.databaseProducts.length > 0
        ? backupData.databaseProducts
        : backupData.localJsonProducts || [];

    // Filter only Abayas
    const abayas = allSourceProducts.filter(p => 
        (p.collectionType && p.collectionType.toLowerCase().includes('abaya')) ||
        (p.title && p.title.toLowerCase().includes('abaya')) ||
        (p.desc && p.desc.toLowerCase().includes('abaya'))
    ).map(p => {
        let priceStr = p.price || 'AED 700';
        if (!priceStr.toUpperCase().startsWith('AED')) {
            const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 700;
            priceStr = `AED ${num.toLocaleString()}`;
        }
        return {
            ...p,
            price: priceStr,
            collectionType: 'Luxury Abaya',
            priceRange: 'Under AED 1,000'
        };
    });

    console.log(`Found ${abayas.length} Abaya product(s) to restore:`, abayas.map(a => a.title));

    // Save to local products.json
    const localJsonPath = path.join(dataDir, 'products.json');
    fs.writeFileSync(localJsonPath, JSON.stringify(abayas, null, 2), 'utf8');
    console.log(`✅ Saved ${abayas.length} Abaya product(s) to data/products.json.`);

    // Restore to PostgreSQL database
    if (process.env.DATABASE_URL) {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            console.log('Connecting to PostgreSQL database...');
            // Clear existing table and insert only abayas
            await pool.query('DELETE FROM products');
            for (const p of abayas) {
                const imagesStr = JSON.stringify(p.images || [p.image]);
                await pool.query(
                    `INSERT INTO products (id, title, "desc", price, "collectionType", "colorFamily", "priceRange", pattern, image, images)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     ON CONFLICT (id) DO UPDATE 
                     SET title = EXCLUDED.title, "desc" = EXCLUDED."desc", price = EXCLUDED.price, 
                         "collectionType" = EXCLUDED."collectionType", "colorFamily" = EXCLUDED."colorFamily", 
                         "priceRange" = EXCLUDED."priceRange", pattern = EXCLUDED.pattern, 
                         image = EXCLUDED.image, images = EXCLUDED.images`,
                    [p.id, p.title, p.desc, p.price, p.collectionType, p.colorFamily, p.priceRange, p.pattern, p.image, imagesStr]
                );
            }
            console.log(`✅ PostgreSQL 'products' table updated with ${abayas.length} Abaya products.`);
        } catch (dbErr) {
            console.error('Database restore error:', dbErr);
        } finally {
            await pool.end();
        }
    }

    console.log('Abayas restoration finished successfully.');
}

restoreAbayas().catch(err => {
    console.error('Failed to restore abayas:', err);
    process.exit(1);
});
