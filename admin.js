document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const productList = document.getElementById('productList');
    const cancelBtn = document.getElementById('cancelBtn');
    let currentEditId = null;
    let productsData = [];

    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    const resetForm = () => {
        uploadForm.reset();
        currentEditId = null;
        document.querySelector('.admin-form h2').textContent = 'Add New Product';
        document.getElementById('submitBtn').textContent = 'Upload Product';
        cancelBtn.style.display = 'none';
        // Make image required again for new uploads
        document.getElementById('image').required = true;
    };

    // Fetch and display products
    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products');
            productsData = await res.json();
            productList.innerHTML = '';
            
            productsData.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product-item';
                div.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${p.image}" alt="${p.title}">
                        <div class="product-info">
                            <h4>${p.title}</h4>
                            <p>${p.desc} | <strong style="color:var(--color-accent)">${p.price}</strong></p>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="edit-btn" onclick="editProduct('${p.id}')" style="color:var(--color-accent); background:transparent; border:1px solid var(--color-accent); padding:8px 16px; border-radius:4px; cursor:pointer;">Edit</button>
                        <button class="delete-btn" onclick="deleteProduct('${p.id}')">Delete</button>
                    </div>
                `;
                productList.appendChild(div);
            });
        } catch (err) {
            console.error('Failed to load products');
        }
    };

    // Upload or Update product
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        if (document.getElementById('title').value) formData.append('title', document.getElementById('title').value);
        if (document.getElementById('desc').value) formData.append('desc', document.getElementById('desc').value);
        if (document.getElementById('price').value) formData.append('price', document.getElementById('price').value);
        if (document.getElementById('collectionType').value) formData.append('collectionType', document.getElementById('collectionType').value);
        if (document.getElementById('colorFamily').value) formData.append('colorFamily', document.getElementById('colorFamily').value);
        if (document.getElementById('priceRange').value) formData.append('priceRange', document.getElementById('priceRange').value);
        if (document.getElementById('pattern').value) formData.append('pattern', document.getElementById('pattern').value);
        if (document.getElementById('image').files[0]) formData.append('image', document.getElementById('image').files[0]);

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = currentEditId ? 'Updating...' : 'Uploading...';
        submitBtn.disabled = true;

        try {
            const method = currentEditId ? 'PUT' : 'POST';
            const url = currentEditId ? `/api/products/${currentEditId}` : '/api/products';
            
            const res = await fetch(url, {
                method: method,
                body: formData
            });
            if (res.ok) {
                resetForm();
                loadProducts();
            } else {
                alert('Failed to save product');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    window.editProduct = (id) => {
        const product = productsData.find(p => p.id === id);
        if (!product) return;
        
        currentEditId = id;
        document.getElementById('title').value = product.title;
        document.getElementById('desc').value = product.desc;
        document.getElementById('price').value = product.price;
        if (product.collectionType) document.getElementById('collectionType').value = product.collectionType;
        if (product.colorFamily) document.getElementById('colorFamily').value = product.colorFamily;
        if (product.priceRange) document.getElementById('priceRange').value = product.priceRange;
        if (product.pattern) document.getElementById('pattern').value = product.pattern;
        
        // Image is not required when editing
        document.getElementById('image').required = false;
        
        document.querySelector('.admin-form h2').textContent = 'Edit Product';
        document.getElementById('submitBtn').textContent = 'Update Product';
        cancelBtn.style.display = 'block';
        
        // Scroll up to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete product globally
    window.deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (currentEditId === id) resetForm();
                loadProducts();
            }
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    // Initial load
    loadProducts();
});
