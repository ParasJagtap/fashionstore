document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadForm = document.getElementById('uploadForm');
    const productList = document.getElementById('productList');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const imagesInput = document.getElementById('images');
    const imagePreviewStrip = document.getElementById('imagePreviewStrip');
    const priceInput = document.getElementById('price');
    const pricePreview = document.getElementById('pricePreview');
    const inventorySearch = document.getElementById('inventorySearch');
    const filterCollectionSelect = document.getElementById('filterCollectionSelect');
    const refreshInventoryBtn = document.getElementById('refreshInventoryBtn');

    // Stats and Badges
    const statTotalProducts = document.getElementById('statTotalProducts');
    const statTotalEnquiries = document.getElementById('statTotalEnquiries');
    const badgeInventoryCount = document.getElementById('badgeInventoryCount');
    const badgeEnquiryCount = document.getElementById('badgeEnquiryCount');

    // Tab Elements
    const tabInventoryBtn = document.getElementById('tabInventoryBtn');
    const tabEnquiriesBtn = document.getElementById('tabEnquiriesBtn');
    const inventorySection = document.getElementById('inventorySection');
    const enquiriesSection = document.getElementById('enquiriesSection');
    const enquiryList = document.getElementById('enquiryList');
    const enquirySearch = document.getElementById('enquirySearch');
    const refreshEnquiriesBtn = document.getElementById('refreshEnquiriesBtn');
    const toastContainer = document.getElementById('toastContainer');

    let currentEditId = null;
    let productsData = [];
    let enquiriesData = [];

    // Toast Notification Helper
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    // AED Price Formatter
    const formatAdminPrice = (price) => {
        if (!price) return 'AED 0';
        const s = String(price).trim();
        if (/^AED\s*[\d,]+/i.test(s)) return s.toUpperCase();
        const num = parseInt(s.replace(/[^0-9]/g, ''), 10);
        if (isNaN(num) || num <= 0) return 'AED 0';
        if (s.includes('₹')) {
            return `AED ${Math.round(num / 22.5).toLocaleString()}`;
        }
        return `AED ${num.toLocaleString()}`;
    };

    // Live Price Input Helper
    priceInput.addEventListener('input', () => {
        const val = priceInput.value.trim();
        if (val) {
            pricePreview.textContent = `Formatted: ${formatAdminPrice(val)}`;
        } else {
            pricePreview.textContent = '';
        }
    });

    // Live File Upload Preview Strip
    imagesInput.addEventListener('change', () => {
        imagePreviewStrip.innerHTML = '';
        const files = Array.from(imagesInput.files);
        if (files.length === 0) return;

        files.slice(0, 5).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-thumb';
                img.title = `Image ${index + 1}: ${file.name}`;
                imagePreviewStrip.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });

    // Reset Form
    const resetForm = () => {
        uploadForm.reset();
        currentEditId = null;
        formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
        submitBtn.innerHTML = '<i class="fas fa-upload"></i> Save & Publish Product';
        cancelBtn.style.display = 'none';
        imagePreviewStrip.innerHTML = '';
        pricePreview.textContent = '';
        imagesInput.required = true;
    };

    cancelBtn.addEventListener('click', resetForm);

    // Render Product Cards
    const renderProducts = () => {
        const query = (inventorySearch.value || '').toLowerCase().trim();
        const colFilter = filterCollectionSelect.value;

        const filtered = productsData.filter(p => {
            const matchesQuery = !query || 
                (p.title && p.title.toLowerCase().includes(query)) ||
                (p.desc && p.desc.toLowerCase().includes(query)) ||
                (p.colorFamily && p.colorFamily.toLowerCase().includes(query)) ||
                (p.collectionType && p.collectionType.toLowerCase().includes(query));
            
            const matchesCol = colFilter === 'ALL' || p.collectionType === colFilter;
            return matchesQuery && matchesCol;
        });

        productList.innerHTML = '';

        if (filtered.length === 0) {
            productList.innerHTML = `
                <div style="background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 8px; padding: 36px; text-align: center; color: rgba(245,240,232,0.6);">
                    <i class="fas fa-box-open" style="font-size: 2.2rem; color: var(--admin-gold); margin-bottom: 12px; display: block;"></i>
                    <p style="margin: 0; font-size: 1.05rem;">No matching products found in inventory.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(p => {
            const row = document.createElement('div');
            row.className = 'product-row';

            // Resolve Image Array
            let imagesArr = [];
            if (p.images) {
                try {
                    imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                } catch (e) {
                    imagesArr = [p.image || '/assets/images/logo.png'];
                }
            } else if (p.image) {
                imagesArr = [p.image];
            }
            if (!Array.isArray(imagesArr) || imagesArr.length === 0) {
                imagesArr = ['/assets/images/logo.png'];
            }

            const primaryImg = imagesArr[0].startsWith('/') ? imagesArr[0] : '/' + imagesArr[0];
            const displayPrice = formatAdminPrice(p.price);

            row.innerHTML = `
                <div class="product-main">
                    <div class="product-thumb-container">
                        <img src="${primaryImg}" alt="${p.title}" onerror="this.src='/assets/images/logo.png'">
                        ${imagesArr.length > 1 ? `<span class="thumb-badge"><i class="fas fa-images"></i> ${imagesArr.length}</span>` : ''}
                    </div>
                    <div class="product-details">
                        <h4>${p.title}</h4>
                        <div class="product-tags">
                            <span class="tag-pill"><i class="fas fa-gem"></i> ${p.collectionType || 'Luxury'}</span>
                            ${p.colorFamily ? `<span class="tag-pill"><i class="fas fa-palette"></i> ${p.colorFamily}</span>` : ''}
                            ${p.pattern ? `<span class="tag-pill"><i class="fas fa-feather-alt"></i> ${p.pattern}</span>` : ''}
                            <span class="tag-pill" style="border-color: rgba(201,168,76,0.4);"><i class="fas fa-layer-group"></i> ${p.priceRange || 'Standard'}</span>
                        </div>
                        <div class="product-price-tag">${displayPrice}</div>
                        <p class="product-desc-snippet">${p.desc || ''}</p>
                    </div>
                </div>
                <div class="row-actions">
                    <button class="action-btn btn-edit" onclick="editProduct('${p.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProduct('${p.id}', '${escapeHtml(p.title)}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            `;
            productList.appendChild(row);
        });
    };

    const escapeHtml = (text) => {
        return (text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    };

    // Load Products
    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products');
            productsData = await res.json();

            // Update stats
            statTotalProducts.textContent = productsData.length;
            badgeInventoryCount.textContent = productsData.length;

            renderProducts();
        } catch (err) {
            console.error('Failed to load products', err);
            showToast('Failed to load products', 'error');
        }
    };

    // Search and Filter Listeners
    inventorySearch.addEventListener('input', renderProducts);
    filterCollectionSelect.addEventListener('change', renderProducts);
    refreshInventoryBtn.addEventListener('click', () => {
        loadProducts();
        showToast('Inventory refreshed');
    });

    // Upload or Update Product
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rawPrice = priceInput.value;
        const normalizedPrice = formatAdminPrice(rawPrice);

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value.trim());
        formData.append('desc', document.getElementById('desc').value.trim());
        formData.append('price', normalizedPrice);
        formData.append('collectionType', document.getElementById('collectionType').value);
        formData.append('colorFamily', document.getElementById('colorFamily').value);
        formData.append('priceRange', document.getElementById('priceRange').value);
        formData.append('pattern', document.getElementById('pattern').value);

        const imageFiles = imagesInput.files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = currentEditId ? '<i class="fas fa-spinner fa-spin"></i> Updating...' : '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        submitBtn.disabled = true;

        try {
            const method = currentEditId ? 'PUT' : 'POST';
            const url = currentEditId ? `/api/products/${currentEditId}` : '/api/products';

            const res = await fetch(url, {
                method: method,
                body: formData
            });

            if (res.ok) {
                showToast(currentEditId ? 'Product updated successfully!' : 'Product added successfully!');
                resetForm();
                await loadProducts();
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || 'Failed to save product', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('An error occurred during submission', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        }
    });

    // Edit Product Trigger
    window.editProduct = (id) => {
        const product = productsData.find(p => String(p.id) === String(id));
        if (!product) return;

        currentEditId = id;
        document.getElementById('title').value = product.title || '';
        document.getElementById('desc').value = product.desc || '';
        document.getElementById('price').value = formatAdminPrice(product.price);
        pricePreview.textContent = `Formatted: ${formatAdminPrice(product.price)}`;

        if (product.collectionType) {
            const colSelect = document.getElementById('collectionType');
            colSelect.value = (product.collectionType === 'Katan Silk') ? 'Banarasi Silk' : product.collectionType;
        }
        if (product.colorFamily) document.getElementById('colorFamily').value = product.colorFamily;
        if (product.priceRange) {
            const prSelect = document.getElementById('priceRange');
            if (product.priceRange.includes('AED')) {
                prSelect.value = product.priceRange;
            } else {
                const pNum = parseInt(formatAdminPrice(product.price).replace(/[^0-9]/g, ''), 10) || 0;
                if (pNum < 1000) prSelect.value = 'Under AED 1,000';
                else if (pNum <= 2500) prSelect.value = 'AED 1,000 - AED 2,500';
                else prSelect.value = 'AED 2,500+';
            }
        }
        if (product.pattern) document.getElementById('pattern').value = product.pattern;

        // Image upload is optional when editing
        imagesInput.required = false;

        // Display current images in preview
        imagePreviewStrip.innerHTML = '';
        let imagesArr = [];
        if (product.images) {
            try { imagesArr = typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch (e) {}
        } else if (product.image) {
            imagesArr = [product.image];
        }
        if (imagesArr.length > 0) {
            const label = document.createElement('small');
            label.style.display = 'block';
            label.style.width = '100%';
            label.style.color = 'rgba(201,168,76,0.8)';
            label.textContent = 'Current Photos (select new files only if you wish to replace them):';
            imagePreviewStrip.appendChild(label);

            imagesArr.forEach(imgUrl => {
                const src = imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl;
                const img = document.createElement('img');
                img.src = src;
                img.className = 'preview-thumb';
                imagePreviewStrip.appendChild(img);
            });
        }

        formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
        cancelBtn.style.display = 'inline-flex';

        window.scrollTo({ top: 180, behavior: 'smooth' });
    };

    // Delete Product
    window.deleteProduct = async (id, title) => {
        if (!confirm(`Are you sure you want to delete "${title || 'this product'}" from inventory?`)) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Product deleted from inventory');
                if (currentEditId === id) resetForm();
                await loadProducts();
            } else {
                showToast('Failed to delete product', 'error');
            }
        } catch (err) {
            console.error('Failed to delete', err);
            showToast('Error deleting product', 'error');
        }
    };

    // --- Enquiries Tab Logic ---
    const renderEnquiries = () => {
        const query = (enquirySearch.value || '').toLowerCase().trim();
        const filtered = enquiriesData.filter(e => {
            return !query ||
                (e.name && e.name.toLowerCase().includes(query)) ||
                (e.email && e.email.toLowerCase().includes(query)) ||
                (e.phone && e.phone.toLowerCase().includes(query)) ||
                (e.message && e.message.toLowerCase().includes(query));
        });

        enquiryList.innerHTML = '';

        if (filtered.length === 0) {
            enquiryList.innerHTML = `
                <div style="background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 8px; padding: 36px; text-align: center; color: rgba(245,240,232,0.6);">
                    <i class="fas fa-inbox" style="font-size: 2.2rem; color: var(--admin-gold); margin-bottom: 12px; display: block;"></i>
                    <p style="margin: 0; font-size: 1.05rem;">No customer enquiries found.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(e => {
            const dateStr = new Date(e.created_at).toLocaleString('en-AE', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });

            // Clean phone for WhatsApp
            const cleanPhone = (e.phone || '').replace(/[^0-9]/g, '');
            const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${e.name}, thank you for contacting Banarasi Sanskriti regarding your enquiry.`)}` : null;

            const mailtoLink = `mailto:${e.email}?subject=${encodeURIComponent(`Banarasi Sanskriti - Inquiry Follow-up`)}&body=${encodeURIComponent(`Dear ${e.name},\n\nThank you for reaching out to Banarasi Sanskriti.\n\nIn response to your query:\n"${e.message}"\n\nWarm regards,\nBanarasi Sanskriti Team`)}`;

            const card = document.createElement('div');
            card.className = 'enquiry-card';
            card.innerHTML = `
                <div class="enquiry-header">
                    <div class="enquiry-user">
                        <h4><i class="fas fa-user-circle" style="color: var(--admin-gold); margin-right: 6px;"></i> ${e.name}</h4>
                        <div class="enquiry-contact-links">
                            <a href="${mailtoLink}"><i class="fas fa-envelope"></i> ${e.email}</a>
                            ${e.phone ? `<span><i class="fas fa-phone-alt"></i> ${e.phone}</span>` : ''}
                            ${waLink ? `<a href="${waLink}" target="_blank" style="color: #25d366;"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>` : ''}
                        </div>
                    </div>
                    <button class="action-btn btn-delete" onclick="deleteEnquiry(${e.id})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
                <div class="enquiry-message-box">
                    ${e.message}
                </div>
                <div class="enquiry-footer">
                    <span class="enquiry-time"><i class="far fa-clock"></i> Received on ${dateStr}</span>
                    <a href="${mailtoLink}" class="admin-btn-secondary" style="font-size: 0.82rem; padding: 6px 12px;">
                        <i class="fas fa-reply"></i> Reply via Email
                    </a>
                </div>
            `;
            enquiryList.appendChild(card);
        });
    };

    const loadEnquiries = async () => {
        try {
            const res = await fetch('/api/enquiries');
            if (!res.ok) throw new Error('Failed to fetch');
            enquiriesData = await res.json();

            statTotalEnquiries.textContent = enquiriesData.length;
            badgeEnquiryCount.textContent = enquiriesData.length;

            renderEnquiries();
        } catch (err) {
            console.error('Failed to load enquiries', err);
            showToast('Error loading customer enquiries', 'error');
        }
    };

    enquirySearch.addEventListener('input', renderEnquiries);
    refreshEnquiriesBtn.addEventListener('click', () => {
        loadEnquiries();
        showToast('Enquiries refreshed');
    });

    window.deleteEnquiry = async (id) => {
        if (!confirm('Are you sure you want to delete this customer enquiry?')) return;
        try {
            const res = await fetch(`/api/enquiries/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Enquiry deleted');
                loadEnquiries();
            } else {
                showToast('Failed to delete enquiry', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error deleting enquiry', 'error');
        }
    };

    // --- Tab Navigation ---
    tabInventoryBtn.addEventListener('click', () => {
        tabInventoryBtn.classList.add('active');
        tabEnquiriesBtn.classList.remove('active');
        inventorySection.style.display = 'block';
        enquiriesSection.style.display = 'none';
        loadProducts();
    });

    tabEnquiriesBtn.addEventListener('click', () => {
        tabEnquiriesBtn.classList.add('active');
        tabInventoryBtn.classList.remove('active');
        inventorySection.style.display = 'none';
        enquiriesSection.style.display = 'block';
        loadEnquiries();
    });

    // Initial Load
    loadProducts();
    loadEnquiries();
});
