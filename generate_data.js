const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const titles = ["Midnight Bloom", "Crimson Elegance", "Golden Jaal", "Emerald Heritage", "Ruby Classic", "Sapphire Drape", "Ivory Mist", "Vermillion Queen", "Royal Orchid", "Sunset Brocade"];
const descs = ["Pure Silk with Gold Zari", "Contemporary Silver Zari Weave", "Luminous Tissue Finish", "Rich Traditional Brocade", "Handwoven Katan Silk", "Featherlight Organza Kora", "Fluid Georgette Crepe", "Simplified Shattir Weave", "Heavy Bridal Masterpiece", "Elegant Floral Motifs"];
const prices = ["₹45,000", "₹32,000", "₹55,000", "₹48,000", "₹38,000", "₹28,500", "₹22,000", "₹15,000", "₹85,000", "₹65,000"];

const products = [];
for (let i = 1; i <= 50; i++) {
    products.push({
        id: (Date.now() + i).toString(),
        title: titles[i % titles.length],
        desc: descs[(i * 3) % descs.length],
        price: prices[(i * 7) % prices.length],
        image: `assets/images/catalog/prod-${i}.jpeg`
    });
}

fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
console.log('products.json generated successfully.');
