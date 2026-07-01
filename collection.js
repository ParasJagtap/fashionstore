document.addEventListener('DOMContentLoaded', () => {
  // Collection data map (same as index, ideally we'd share this via a module but keeping it simple)
  const collectionData = {
    katan: {
      badge: 'The Sedan',
      title: 'Katan Silk',
      desc: 'The Katan is the gold standard of Banarasi sarees — pure silk, durable, and timelessly classic. Created by twisting pure silk threads together to form a firm, resilient fabric, the Katan is built to last generations.',
      fabric: 'Pure Mulberry Silk',
      weave: 'Plain weave with Kadwa technique',
      occasion: 'Weddings, Pujas, Grand Celebrations'
    },
    organza: {
      badge: 'The Convertible',
      title: 'Organza (Kora) with Zari',
      desc: 'The Organza Kora is a masterpiece of contrasts — a featherlight, sheer body meets rich gold or silver zari borders for an effect that is both ethereal and opulent.',
      fabric: 'Kora (stiff organza silk)',
      weave: 'Open weave with heavy border Zari',
      occasion: 'Receptions, Festive Gatherings'
    },
    georgette: {
      badge: 'The Sport Model',
      title: 'Georgette',
      desc: 'The Georgette is for the modern woman who values elegance without compromise. Made from crepe yarn, it offers unmatched fluidity and a beautiful drape that moves with you.',
      fabric: 'Crepe yarn',
      weave: 'Crinkled plain weave with Zari',
      occasion: 'Office Events, Casual Celebrations'
    },
    shattir: {
      badge: 'The Daily Driver',
      title: 'Shattir',
      desc: 'The Shattir is your everyday companion — the most accessible version of the Banarasi weave that doesn\'t sacrifice charm. Simplified patterns and lighter construction.',
      fabric: 'Silk blend with lighter thread count',
      weave: 'Simplified Banarasi weave',
      occasion: 'Daily Wear, Small Gatherings'
    }
  };

  // Get the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');

  // Populate data if type exists
  if (type && collectionData[type]) {
    const data = collectionData[type];
    const badgeEl = document.getElementById('showroomBadge');
    const titleEl = document.getElementById('showroomTitle');
    const descEl = document.getElementById('showroomDesc');
    const fabricEl = document.getElementById('showroomFabric');
    const weaveEl = document.getElementById('showroomWeave');
    const occasionEl = document.getElementById('showroomOccasion');

    if(badgeEl) badgeEl.textContent = data.badge;
    if(titleEl) titleEl.textContent = data.title;
    if(descEl) descEl.textContent = data.desc;
    if(fabricEl) fabricEl.textContent = data.fabric;
    if(weaveEl) weaveEl.textContent = data.weave;
    if(occasionEl) occasionEl.textContent = data.occasion;

    // Highlight active link in the sidebar
    const activeLink = document.querySelector(`.filter-link[data-type="${type}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  // --- Fetch Catalog Items Dynamically with Filtering & Sorting ---
  const catalogGrid = document.getElementById('catalogGrid');
  const sortSelect = document.getElementById('sort-select');
  const filterCheckboxes = document.querySelectorAll('input[type="checkbox"][data-filter]');
  const collectionLinks = document.querySelectorAll('.filter-link');
  
  if (catalogGrid) {
    let allProducts = [];
    
    // Check if there's a type in URL
    const urlParams = new URLSearchParams(window.location.search);
    let activeCollection = urlParams.get('type') || '';
    
    // Update active state on collection links
    collectionLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        activeCollection = link.getAttribute('data-type');
        
        collectionLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update URL without reloading
        window.history.pushState({}, '', `collection?type=${activeCollection}`);
        renderProducts();
      });
      
      if (link.getAttribute('data-type') === activeCollection) {
        link.classList.add('active');
      }
    });

    const renderProducts = () => {
      // 1. Gather active filters
      const activeFilters = {
        colorFamily: [],
        priceRange: [],
        pattern: []
      };
      
      filterCheckboxes.forEach(cb => {
        if (cb.checked) {
          activeFilters[cb.getAttribute('data-filter')].push(cb.value);
        }
      });
      
      // 2. Filter products
      let filtered = allProducts.filter(p => {
        // Collection Filter
        if (activeCollection && activeCollection !== 'all') {
          // Normalize matching (Katan Silk vs katan)
          const typeMap = {
            'katan': 'Katan Silk',
            'organza': 'Organza (Kora)',
            'georgette': 'Georgette',
            'shattir': 'Shattir'
          };
          if (p.collectionType !== typeMap[activeCollection] && p.collectionType !== activeCollection) {
            return false;
          }
        }
        
        // Color Filter
        if (activeFilters.colorFamily.length > 0 && !activeFilters.colorFamily.includes(p.colorFamily)) return false;
        
        // Price Filter
        if (activeFilters.priceRange.length > 0 && !activeFilters.priceRange.includes(p.priceRange)) return false;
        
        // Pattern Filter
        if (activeFilters.pattern.length > 0 && !activeFilters.pattern.includes(p.pattern)) return false;
        
        return true;
      });
      
      // 3. Sort products
      if (sortSelect) {
        const sortVal = sortSelect.value;
        if (sortVal === 'Price: Low to High' || sortVal === 'Price: High to Low') {
          filtered.sort((a, b) => {
            // Extract numeric value from "₹45,000"
            const getPrice = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
            const priceA = getPrice(a.price);
            const priceB = getPrice(b.price);
            
            if (sortVal === 'Price: Low to High') return priceA - priceB;
            return priceB - priceA;
          });
        }
      }
      
      // 4. Render
      let gridHtml = '';
      if (filtered.length === 0) {
        gridHtml = '<p style="color:#fff; padding: 40px;">No masterpieces match your current selection.</p>';
      } else {
        filtered.forEach(p => {
          gridHtml += `
            <div class="catalog-card" onclick="openModal('${p.id}')">
              <div class="card-image-wrap">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
              </div>
              <div class="card-info">
                <h3 class="card-title">${p.title}</h3>
                <p class="card-desc" style="color:rgba(245,240,232,0.6); font-size:0.8rem; margin-bottom:4px;">
                  ${p.collectionType || ''} | ${p.colorFamily || ''} | ${p.pattern || ''}
                </p>
                <p class="card-price" style="display: none;">${p.price}</p>
              </div>
            </div>
          `;
        });
      }
      catalogGrid.innerHTML = gridHtml;
      
      // Update results count
      const toolbarResults = document.querySelector('.toolbar-results');
      if (toolbarResults) {
        toolbarResults.textContent = `Showing ${filtered.length} masterpieces`;
      }
    };

    // Attach Event Listeners
    filterCheckboxes.forEach(cb => cb.addEventListener('change', renderProducts));
    if (sortSelect) sortSelect.addEventListener('change', renderProducts);

    // Modal Logic
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.getElementById('modalBackdrop');
    
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (backdrop) backdrop.addEventListener('click', () => modal.classList.remove('active'));

    window.openModal = (id) => {
      // Find exact product (handle both string/int id matching just in case)
      const p = allProducts.find(product => String(product.id) === String(id));
      if (p) {
        document.getElementById('modalImg').src = p.image;
        document.getElementById('modalBadge').textContent = p.collectionType || 'Banarasi';
        document.getElementById('modalTitle').textContent = p.title;
        document.getElementById('modalDesc').textContent = p.desc || '';
        document.getElementById('modalColor').textContent = p.colorFamily || '-';
        document.getElementById('modalPattern').textContent = p.pattern || '-';
        document.getElementById('modalPrice').textContent = p.price || '-';
        
        modal.classList.add('active');
      }
    };

    // Initial Fetch
    fetch('/api/products')
      .then(res => res.json())
      .then(products => {
        allProducts = products;
        renderProducts();
      })
      .catch(err => {
        console.error('Failed to load products', err);
        catalogGrid.innerHTML = '<p style="color:red">Failed to load catalog. Ensure the server is running.</p>';
      });
  }
});
