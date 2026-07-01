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

// Helper function to send email notification via Resend API
const sendEmailNotification = async (enquiry) => {
    if (!process.env.RESEND_API_KEY) {
        console.log('Skipping email notification: RESEND_API_KEY is not set in environment variables.');
        return;
    }
    
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Banarasi Sanskriti <onboarding@resend.dev>',
                to: process.env.NOTIFICATION_EMAIL || 'info@banarasisanskriti.com',
                subject: `New Saree Enquiry from ${enquiry.name}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e0e0e0; padding: 24px; border-radius: 8px;">
                        <h2 style="color: #8B1A2B; margin-top: 0; font-family: Georgia, serif;">New Customer Enquiry Received</h2>
                        <hr style="border: 0; border-top: 1px solid #8B1A2B; margin: 20px 0;">
                        <p><strong>Customer Name:</strong> ${enquiry.name}</p>
                        <p><strong>Email Address:</strong> ${enquiry.email}</p>
                        <p><strong>Phone Number:</strong> ${enquiry.phone || 'N/A'}</p>
                        <p><strong>Message / Requirements:</strong></p>
                        <div style="background: #FAF6F0; padding: 16px; border-left: 4px solid #C9A84C; font-style: italic; white-space: pre-line; line-height: 1.6; color: #2C1810; border-radius: 0 4px 4px 0;">
                            ${enquiry.message}
                        </div>
                        <br>
                        <p style="font-size: 0.8rem; color: #888; margin-bottom: 0;">Submitted on ${new Date(enquiry.created_at).toLocaleString('en-IN')}</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Failed to send email notification:', errData);
        } else {
            console.log('Email notification sent successfully.');
        }
    } catch (err) {
        console.error('Email notification error:', err);
    }
};

// Basic Auth Middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Portal"');
        return res.status(401).send('Authentication required');
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = credentials[0];
    const pass = credentials[1];

    const expectedUser = process.env.ADMIN_USER || 'admin';
    const expectedPass = process.env.ADMIN_PASS || 'sanskriti2026';

    if (user === expectedUser && pass === expectedPass) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Portal"');
        return res.status(401).send('Authentication required');
    }
};

// Secure Admin Portal View Route
const adminPath = process.env.ADMIN_PATH || '/admin-sanskriti-portal';
app.get(adminPath, auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.view'));
});

// Obscure standard /admin and /admin.html paths to return 404
app.get(['/admin', '/admin.html'], (req, res) => {
    res.status(404).send('Not Found');
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
app.post('/api/products', auth, upload.single('image'), async (req, res) => {
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
app.put('/api/products/:id', auth, upload.single('image'), async (req, res) => {
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
app.delete('/api/products/:id', auth, async (req, res) => {
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

// API: Submit contact enquiry
app.post('/api/enquiries', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const queryText = `
            INSERT INTO enquiries (name, email, phone, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(queryText, [name, email, phone, message]);

        // Send email asynchronously (non-blocking)
        sendEmailNotification(rows[0]).catch(err => console.error('Email notification trigger failed:', err));

        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save enquiry' });
    }
});

// API: Get all enquiries (for Admin Dashboard)
app.get('/api/enquiries', auth, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
});

// API: Delete enquiry (for Admin Dashboard)
app.delete('/api/enquiries/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await pool.query('DELETE FROM enquiries WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete enquiry' });
    }
});

// Route: Clean URL mapping for collections
app.get('/collection/:type', (req, res) => {
    res.sendFile(path.join(__dirname, 'collection.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
