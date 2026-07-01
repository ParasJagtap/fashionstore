const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'products.json');

const collections = ['Katan Silk', 'Organza (Kora)', 'Georgette', 'Shattir'];
const colors = ['Crimson Red', 'Midnight Blue', 'Emerald Green', 'Golden Glow', 'Ivory'];
const prices = ['₹10,000 - ₹25,000', '₹25,000 - ₹50,000', '₹50,000+'];
const patterns = ['Floral Jaal', 'Geometric Buti', 'Shikargah'];

const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

products.forEach(p => {
    if (!p.collectionType) p.collectionType = collections[Math.floor(Math.random() * collections.length)];
    if (!p.colorFamily) p.colorFamily = colors[Math.floor(Math.random() * colors.length)];
    if (!p.priceRange) p.priceRange = prices[Math.floor(Math.random() * prices.length)];
    if (!p.pattern) p.pattern = patterns[Math.floor(Math.random() * patterns.length)];
});

fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
console.log('Random categories assigned successfully!');
