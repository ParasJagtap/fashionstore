require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreInventory() {
    const backupFileArg = process.argv[2];
    const dataDir = path.join(__dirname, 'data');
    
    let targetFile = backupFileArg;
    if (!targetFile) {
        // Find latest backup file
        const files = fs.readdirSync(dataDir)
            .filter(f => f.startsWith('products_backup_') && f.endsWith('.json'))
            .sort()
            .reverse();
        
        if (files.length === 0) {
            console.error('No backup files found in data/ directory.');
            process.exit(1);
        }
        targetFile = path.join(dataDir, files[0]);
    }

    console.log(`Restoring from backup: ${targetFile}`);
    const backupContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    const productsToRestore = backupContent.databaseProducts && backupContent.databaseProducts.length > 0 
        ? backupContent.databaseProducts 
        : backupContent.localJsonProducts || [];

    console.log(`Found ${productsToRestore.length} products to restore.`);

    function normalizePriceToAED(priceStr) {
        if (!priceStr) return 'AED 0';
        const s = String(priceStr).trim();
        if (/^AED\s*[\d,]+/i.test(s)) return s;
        const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
        if (isNaN(num) || num <= 0) return 'AED 0';
        if (s.includes('₹')) {
            return `AED ${Math.round(num / 22.5).toLocaleString()}`;
        }
        return `AED ${num.toLocaleString()}`;
    }

    function normalizeRangeToAED(rangeStr, priceVal) {
        if (rangeStr && rangeStr.includes('AED')) return rangeStr;
        const num = parseInt(priceVal.replace(/[^0-9]/g, ''), 10) || 0;
        if (num < 1000) return 'Under AED 1,000';
        if (num <= 2500) return 'AED 1,000 - AED 2,500';
        return 'AED 2,500+';
    }

    const normalizedProducts = productsToRestore.map(p => {
        const aedPrice = normalizePriceToAED(p.price);
        const aedRange = normalizeRangeToAED(p.priceRange, aedPrice);
        return {
            ...p,
            price: aedPrice,
            priceRange: aedRange
        };
    });

    // Restore to local JSON
    const localJsonPath = path.join(dataDir, 'products.json');
    fs.writeFileSync(localJsonPath, JSON.stringify(normalizedProducts, null, 2), 'utf8');
    console.log('✅ Local data/products.json restored with AED pricing.');

    // Restore to PostgreSQL
    if (process.env.DATABASE_URL) {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await pool.query('DELETE FROM products');
            for (const p of normalizedProducts) {
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
            console.log(`✅ Database 'products' table restored with ${normalizedProducts.length} AED items.`);
        } catch (err) {
            console.error('Error restoring to database:', err);
        } finally {
            await pool.end();
        }
    }
    console.log('Restore complete!');
}

restoreInventory().catch(err => {
    console.error('Restore failed:', err);
    process.exit(1);
});
