document.addEventListener('DOMContentLoaded', () => {
  // Collection data map (same as index, ideally we'd share this via a module but keeping it simple)
  const collectionData = {
    katan: {
      badge: { en: 'The Sedan', ar: 'السيارات الصالون (السيدان)' },
      title: { en: 'Katan Silk', ar: 'حرير كتان' },
      desc: {
        en: 'The Katan is the gold standard of Banarasi sarees — pure silk, durable, and timelessly classic. Created by twisting pure silk threads together to form a firm, resilient fabric, the Katan is built to last generations.',
        ar: 'حرير الكتان هو المعيار الذهبي لساريات بنارسي — حرير خالص، متين، وكلاسيكي خالٍ من الزمن. يتم إنتاجه بليّ خيوط الحرير الخالص معاً لتشكيل قماش متين وقوي يدوم لأجيال.'
      },
      fabric: { en: 'Pure Mulberry Silk', ar: 'حرير التوت الخالص' },
      weave: { en: 'Plain weave with Kadwa technique', ar: 'نسيج عادي بتقنية كادوا' },
      occasion: { en: 'Weddings, Pujas, Grand Celebrations', ar: 'الأعراس، المناسبات الكبرى' }
    },
    organza: {
      badge: { en: 'The Convertible', ar: 'الأخف وزناً' },
      title: { en: 'Organza (Kora) with Zari', ar: 'أورغانزا (كورا) مع زاري' },
      desc: {
        en: 'The Organza Kora is a masterpiece of contrasts — a featherlight, sheer body meets rich gold or silver zari borders for an effect that is both ethereal and opulent.',
        ar: 'أورغانزا كورا هي تحفة من التناقضات — جسم شفاف خفيف كالأثير يلتصق بحدود زاري ذهبية أو فضية غنية لمظهر ينبض بالفخامة.'
      },
      fabric: { en: 'Kora (stiff organza silk)', ar: 'حرير أورغانزا كورا' },
      weave: { en: 'Open weave with heavy border Zari', ar: 'نسيج مفتوح مع زاري فاخر على الحدود' },
      occasion: { en: 'Receptions, Festive Gatherings', ar: 'حفلات الاستقبال، الأمسيات الاحتفالية' }
    },
    georgette: {
      badge: { en: 'The Sport Model', ar: 'النموذج العصري' },
      title: { en: 'Georgette', ar: 'جورجيت' },
      desc: {
        en: 'The Georgette is for the modern woman who values elegance without compromise. Made from crepe yarn, it offers unmatched fluidity and a beautiful drape that moves with you.',
        ar: 'الجورجيت صُمم للمرأة المعاصرة التي تقدّر الأناقة دون مساومة. مصنوع من خيوط الكريب، ويوفر انسيابية فائقة وسهولة في الارتداء.'
      },
      fabric: { en: 'Crepe yarn', ar: 'خيط الكريب' },
      weave: { en: 'Crinkled plain weave with Zari', ar: 'نسيج مجعد مع زاري' },
      occasion: { en: 'Office Events, Casual Celebrations', ar: 'المناسبات الرسمية والعصرية' }
    },
    shattir: {
      badge: { en: 'The Daily Driver', ar: 'الرفيق اليومي' },
      title: { en: 'Shattir', ar: 'شاتير' },
      desc: {
        en: 'The Shattir is your everyday companion — the most accessible version of the Banarasi weave that doesn\'t sacrifice charm. Simplified patterns and lighter construction.',
        ar: 'شاتير هو رفيقك اليومي — الإصدار الأكثر سهولة ومرونة من نسيج بنارسي دون التضحية بالجمال والجاذبية.'
      },
      fabric: { en: 'Silk blend with lighter thread count', ar: 'مزيج الحرير بخيوط خفيفة' },
      weave: { en: 'Simplified Banarasi weave', ar: 'نسيج بنارسي مبسط' },
      occasion: { en: 'Daily Wear, Small Gatherings', ar: 'الارتداء اليومي، التجمعات البسيطة' }
    },
    abaya: {
      badge: { en: 'New Collection Drop', ar: 'إطلاق مجموعة جديدة' },
      title: { en: 'Luxury Abaya', ar: 'عباءة فاخرة' },
      desc: {
        en: 'A fusion of Banarasi heritage and UAE modernity — our Luxury Abaya collection brings the timeless artistry of handwoven Banarasi craftsmanship to contemporary silhouettes designed for the discerning modern woman.',
        ar: 'مزج رائع بين التراث البنارسي والحداثة الإماراتي — تقدم مجموعة العباءة الفاخرة حرفية النسيج اليدوي البنارسي الأصيل بتصاميم معاصرة.'
      },
      fabric: { en: 'Premium Banarasi Silk & Blends', ar: 'حرير بنارسي فاخر ومزيج متميز' },
      weave: { en: 'Handwoven Banarasi Zari work', ar: 'عمل زاري بنارسي منسوج يدوياً' },
      occasion: { en: 'Everyday Luxury, Formal Events, Eid', ar: 'الفخامة اليومية، المناسبات الرسمية، الأعياد' }
    }
  };

  // Get the query parameter or path parameter
  const urlParams = new URLSearchParams(window.location.search);
  let type = urlParams.get('type');
  if (!type) {
    const parts = window.location.pathname.split('/');
    if (parts.length >= 3 && parts[1] === 'collection') {
      type = parts[2];
    }
  }

  const getLang = () => document.documentElement.lang || 'en';

  // Populate data if type exists
  if (type && collectionData[type]) {
    const data = collectionData[type];
    const lang = getLang();
    const badgeEl = document.getElementById('showroomBadge');
    const titleEl = document.getElementById('showroomTitle');
    const descEl = document.getElementById('showroomDesc');
    const fabricEl = document.getElementById('showroomFabric');
    const weaveEl = document.getElementById('showroomWeave');
    const occasionEl = document.getElementById('showroomOccasion');

    if(badgeEl) badgeEl.textContent = typeof data.badge === 'object' ? data.badge[lang] || data.badge.en : data.badge;
    if(titleEl) titleEl.textContent = typeof data.title === 'object' ? data.title[lang] || data.title.en : data.title;
    if(descEl) descEl.textContent = typeof data.desc === 'object' ? data.desc[lang] || data.desc.en : data.desc;
    if(fabricEl) fabricEl.textContent = typeof data.fabric === 'object' ? data.fabric[lang] || data.fabric.en : data.fabric;
    if(weaveEl) weaveEl.textContent = typeof data.weave === 'object' ? data.weave[lang] || data.weave.en : data.weave;
    if(occasionEl) occasionEl.textContent = typeof data.occasion === 'object' ? data.occasion[lang] || data.occasion.en : data.occasion;

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
    
    // Check if there's a type in URL (query param or subpath)
    const urlParams = new URLSearchParams(window.location.search);
    let activeCollection = urlParams.get('type') || '';
    if (!activeCollection) {
      const parts = window.location.pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'collection') {
        activeCollection = parts[2];
      }
    }
    
    // Update active state on collection links
    collectionLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        activeCollection = link.getAttribute('data-type');
        
        collectionLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update URL without reloading
        window.history.pushState({}, '', `/collection/${activeCollection}`);
        renderProducts();
      });
      
      if (link.getAttribute('data-type') === activeCollection) {
        link.classList.add('active');
      }
    });

    // Mobile Filter Sidebar Toggle (bound once outside the loop)
    const sidebar = document.querySelector('.catalog-sidebar');
    const sidebarTitle = document.querySelector('.sidebar-title');
    if (sidebarTitle && sidebar) {
      sidebarTitle.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.toggle('active');
          sidebarTitle.classList.toggle('active');
        }
      });
    }

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
            'shattir': 'Shattir',
            'abaya': 'Luxury Abaya'
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
      const lang = document.documentElement.lang || 'en';
      if (filtered.length === 0) {
        gridHtml = `<p style="color:#fff; padding: 40px;">${lang === 'ar' ? 'لا تتوفر قطع تطابق اختيارك الحالي.' : 'No masterpieces match your current selection.'}</p>`;
      } else {
        filtered.forEach(p => {
          gridHtml += `
            <div class="catalog-card" onclick="openModal('${p.id}')">
              <div class="card-image-wrap">
                 <img src="${p.image.startsWith('/') ? p.image : '/' + p.image}" alt="${p.title}" loading="lazy">
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
        toolbarResults.textContent = lang === 'ar' ? `عرض ${filtered.length} قطع رائعة` : `Showing ${filtered.length} masterpieces`;
      }
    };

    // Attach Event Listeners
    filterCheckboxes.forEach(cb => cb.addEventListener('change', renderProducts));
    if (sortSelect) sortSelect.addEventListener('change', renderProducts);

    // Modal Logic
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.getElementById('modalBackdrop');
    
    // Inline Enquiry Form elements
    const modalSpecsView = document.getElementById('modalSpecsView');
    const modalFormView = document.getElementById('modalFormView');
    const modalEnquireBtn = document.getElementById('modalEnquireBtn');
    const modalFormBackBtn = document.getElementById('modalFormBackBtn');
    const modalEnquiryForm = document.getElementById('modalEnquiryForm');

    const resetModalView = () => {
      modalSpecsView.style.display = 'block';
      modalFormView.style.display = 'none';
      modalEnquiryForm.reset();
    };

    if (closeBtn) closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      resetModalView();
    });
    if (backdrop) backdrop.addEventListener('click', () => {
      modal.classList.remove('active');
      resetModalView();
    });

    let activeProduct = null;
    let currentImageIndex = 0;
    let currentImages = [];

    const sliderWrapper = document.getElementById('modalImagesWrapper');
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');
    const sliderDots = document.getElementById('sliderDots');

    const updateSliderUI = () => {
      // Update images
      const imgs = sliderWrapper.querySelectorAll('img');
      imgs.forEach((img, idx) => {
        if (idx === currentImageIndex) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });
      // Update dots
      const dots = sliderDots.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentImageIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    if (sliderPrev) sliderPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentImages.length <= 1) return;
      currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
      updateSliderUI();
    });

    if (sliderNext) sliderNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentImages.length <= 1) return;
      currentImageIndex = (currentImageIndex + 1) % currentImages.length;
      updateSliderUI();
    });

    window.openModal = (id) => {
      // Find exact product (handle both string/int id matching just in case)
      const p = allProducts.find(product => String(product.id) === String(id));
      if (p) {
        activeProduct = p;
        
        // Handle images array or fallback to single image
        let imagesToLoad = [];
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
          imagesToLoad = p.images;
        } else if (typeof p.images === 'string') {
          try {
            imagesToLoad = JSON.parse(p.images);
            if (!Array.isArray(imagesToLoad)) imagesToLoad = [p.image];
          } catch(e) {
            imagesToLoad = [p.image];
          }
        } else {
          imagesToLoad = [p.image];
        }

        currentImages = imagesToLoad;
        currentImageIndex = 0;

        // Render images
        if (sliderWrapper) {
          sliderWrapper.innerHTML = '';
          imagesToLoad.forEach((src, idx) => {
            const img = document.createElement('img');
            img.src = src.startsWith('/') ? src : '/' + src;
            img.alt = `${p.title} - Image ${idx + 1}`;
            if (idx === 0) img.classList.add('active');
            sliderWrapper.appendChild(img);
          });
        }

        // Render dots and arrows
        if (sliderDots) {
          sliderDots.innerHTML = '';
          if (imagesToLoad.length > 1) {
            imagesToLoad.forEach((_, idx) => {
              const dot = document.createElement('div');
              dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
              dot.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImageIndex = idx;
                updateSliderUI();
              });
              sliderDots.appendChild(dot);
            });
            sliderPrev.style.display = 'flex';
            sliderNext.style.display = 'flex';
          } else {
            sliderPrev.style.display = 'none';
            sliderNext.style.display = 'none';
          }
        }

        document.getElementById('modalBadge').textContent = p.collectionType || 'Banarasi';
        document.getElementById('modalTitle').textContent = p.title;
        document.getElementById('modalDesc').textContent = p.desc || '';
        document.getElementById('modalColor').textContent = p.colorFamily || '-';
        document.getElementById('modalPattern').textContent = p.pattern || '-';
        document.getElementById('modalPrice').textContent = p.price || '-';
        
        modal.classList.add('active');
      }
    };

    // Toggle view to Enquiry Form
    if (modalEnquireBtn) {
      modalEnquireBtn.addEventListener('click', () => {
        if (!activeProduct) return;
        modalSpecsView.style.display = 'none';
        modalFormView.style.display = 'block';
        
        // Pre-fill message field based on language
        const messageField = document.getElementById('modal-form-message');
        if (messageField) {
          const lang = document.documentElement.lang || 'en';
          if (lang === 'ar') {
            messageField.value = `مرحباً، أنا مهتم باقتناء قطة "${activeProduct.title}" من مجموعة ${activeProduct.collectionType || ''} (اللون: ${activeProduct.colorFamily || '-'}، النمط: ${activeProduct.pattern || '-'}). يرجى تزويدي بالأسعار وإمكانية التوفر.`;
          } else {
            messageField.value = `Namaste, I am interested in acquiring the "${activeProduct.title}" saree from the ${activeProduct.collectionType || ''} collection (Color: ${activeProduct.colorFamily || '-'}, Pattern: ${activeProduct.pattern || '-'}). Please share pricing and availability.`;
          }
        }
      });
    }

    // Toggle view back to Specs
    if (modalFormBackBtn) {
      modalFormBackBtn.addEventListener('click', () => {
        modalSpecsView.style.display = 'block';
        modalFormView.style.display = 'none';
      });
    }

    // Handle inline form submission
    if (modalEnquiryForm) {
      modalEnquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('modalFormSubmitBtn');
        const originalText = submitBtn.textContent;

        const name = document.getElementById('modal-form-name').value;
        const email = document.getElementById('modal-form-email').value;
        const phone = document.getElementById('modal-form-phone').value;
        const message = document.getElementById('modal-form-message').value;

        submitBtn.textContent = 'Sending...';
        submitBtn.style.pointerEvents = 'none';

        try {
          const res = await fetch('/api/enquiries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, message })
          });

          if (!res.ok) throw new Error('Failed to send');

          submitBtn.textContent = '✓ Sent Successfully';
          submitBtn.style.background = 'var(--color-accent)';
          submitBtn.style.color = 'var(--color-bg-dark)';

          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            submitBtn.style.pointerEvents = '';
            modal.classList.remove('active');
            resetModalView();
          }, 2000);
        } catch (err) {
          console.error(err);
          submitBtn.textContent = '❌ Failed to Send';
          submitBtn.style.background = '#ff4d4d';
          submitBtn.style.color = '#fff';
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            submitBtn.style.pointerEvents = '';
          }, 2000);
        }
      });
    }

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
