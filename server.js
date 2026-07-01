require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
// Serve static files from the root directory without .html extensions
app.use(express.static(__dirname, { extensions: ['html'] }));

// Initialize database pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'assets', 'images', 'catalog'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `prod-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// API: Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// API: Add new product
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { title, desc, price, collectionType, colorFamily, priceRange, pattern } = req.body;
        
        const id = Date.now().toString();
        const pTitle = title || 'New Saree';
        const pDesc = desc || 'Elegant Banarasi Saree';
        const pPrice = price || '₹0';
        const pCollection = collectionType || 'Katan Silk';
        const pColor = colorFamily || 'Crimson Red';
        const pPriceRange = priceRange || '₹10,000 - ₹25,000';
        const pPattern = pattern || 'Floral Jaal';
        const pImage = req.file ? `assets/images/catalog/${req.file.filename}` : 'assets/images/saree-bridal.png';

        const queryText = `
            INSERT INTO products (id, title, "desc", price, "collectionType", "colorFamily", "priceRange", pattern, image)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const { rows } = await pool.query(queryText, [id, pTitle, pDesc, pPrice, pCollection, pColor, pPriceRange, pPattern, pImage]);

        res.status(201).json({ message: 'Product added successfully', product: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// API: Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { title, desc, price, collectionType, colorFamily, priceRange, pattern } = req.body;

        // Fetch existing product to check if it exists and to merge non-updated fields
        const checkRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (checkRes.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const existing = checkRes.rows[0];

        const pTitle = title !== undefined ? title : existing.title;
        const pDesc = desc !== undefined ? desc : existing.desc;
        const pPrice = price !== undefined ? price : existing.price;
        const pCollection = collectionType !== undefined ? collectionType : existing.collectionType;
        const pColor = colorFamily !== undefined ? colorFamily : existing.colorFamily;
        const pPriceRange = priceRange !== undefined ? priceRange : existing.priceRange;
        const pPattern = pattern !== undefined ? pattern : existing.pattern;
        const pImage = req.file ? `assets/images/catalog/${req.file.filename}` : existing.image;

        const queryText = `
            UPDATE products
            SET title = $2, "desc" = $3, price = $4, "collectionType" = $5, "colorFamily" = $6, "priceRange" = $7, pattern = $8, image = $9
            WHERE id = $1
            RETURNING *
        `;
        const { rows } = await pool.query(queryText, [id, pTitle, pDesc, pPrice, pCollection, pColor, pPriceRange, pPattern, pImage]);

        res.json({ message: 'Product updated successfully', product: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// API: Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
