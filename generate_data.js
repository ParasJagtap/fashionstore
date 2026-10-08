const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const titles = ["Midnight Bloom", "Crimson Elegance", "Golden Jaal", "Emerald Heritage", "Ruby Classic", "Sapphire Drape", "Ivory Mist", "Vermillion Queen", "Royal Orchid", "Sunset Brocade"];
const descs = ["Pure Silk with Gold Zari", "Contemporary Silver Zari Weave", "Luminous Tissue Finish", "Rich Traditional Brocade", "Handwoven Banarasi Silk", "Featherlight Organza Kora", "Fluid Georgette Crepe", "Simplified Shattir Weave", "Heavy Bridal Masterpiece", "Elegant Floral Motifs"];
const prices = ["AED 1,950", "AED 1,400", "AED 2,400", "AED 2,100", "AED 1,650", "AED 1,250", "AED 950", "AED 650", "AED 3,700", "AED 2,850"];

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
