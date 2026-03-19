export class ProductManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    viewProduct(productId) {
        const product = this.stateManager.getProduct(productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const body = document.getElementById('productModalBody');
        const title = document.getElementById('modalProductTitle');

        title.textContent = product.name;
        body.innerHTML = this.renderProductDetails(product);

        modal.classList.add('active');
    }

    renderProductDetails(product) {
        const isInWishlist = this.stateManager.isInWishlist(product.id);
        const discount = product.oldPrice ? 
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

        return `
            <div class="product-details">
                <div class="details-gallery">
                    <img src="${product.images[0]}" alt="${product.name}" class="details-image">
                    ${product.images.length > 1 ? `
                        <div class="thumbnail-gallery">
                            ${product.images.map((img, i) => `
                                <img src="${img}" alt="${product.name} - ${i + 1}" 
                                     class="thumbnail" onclick="this.src='${img}'">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="details-info">
                    <h2>${product.name}</h2>
                    
                    <div class="details-rating">
                        <div class="stars">
                            ${this.renderStars(product.rating)}
                        </div>
                        <span>${product.rating} (${product.reviews} reviews)</span>
                    </div>
                    
                    <div class="details-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `
                            <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                            <span class="discount-badge">Save ${discount}%</span>
                        ` : ''}
                    </div>
                    
                    <div class="details-description">
                        ${product.description}
                    </div>
                    
                    <div class="details-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn" onclick="app.productManager.decreaseQuantity()">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" id="productQuantity" value="1" min="1" max="${product.stockCount}">
                            <button class="quantity-btn" onclick="app.productManager.increaseQuantity(${product.stockCount})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <button class="btn btn-primary add-to-cart-detail" 
                                onclick="app.productManager.addToCartFromDetail('${product.id}')"
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        
                        <button class="btn btn-secondary wishlist-detail ${isInWishlist ? 'active' : ''}"
                                onclick="app.productManager.toggleWishlist('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="details-meta">
                        <div class="meta-item">
                            <span class="meta-label">Brand:</span>
                            <span class="meta-value">${product.brand}</span>
                        </div>
                        
                        <div class="meta-item">
                            <span class="meta-label">Category:</span>
                            <span class="meta-value">${product.category}</span>
                        </div>
                        
                        <div class="meta-item">
                            <span class="meta-label">Availability:</span>
                            <span class="meta-value ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                                ${product.inStock ? `${product.stockCount} in stock` : 'Out of Stock'}
                            </span>
                        </div>
                        
                        <div class="meta-item">
                            <span class="meta-label">Tags:</span>
                            <span class="meta-value">
                                ${product.tags.map(tag => `
                                    <span class="product-tag" onclick="app.searchManager.search('${tag}')">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
        if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
        
        return stars;
    }

    addToCartFromDetail(productId) {
        const quantity = parseInt(document.getElementById('productQuantity').value);
        app.cartManager.addToCart(productId, quantity);
    }

    toggleWishlist(productId) {
        const isInWishlist = this.stateManager.isInWishlist(productId);
        
        if (isInWishlist) {
            this.stateManager.removeFromWishlist(productId);
            this.eventBus.emit('notification', {
                message: 'Removed from wishlist',
                type: 'info'
            });
        } else {
            this.stateManager.addToWishlist(productId);
            this.eventBus.emit('notification', {
                message: 'Added to wishlist',
                type: 'success'
            });
        }
        
        // Update UI
        const wishlistBtns = document.querySelectorAll(`[onclick*="toggleWishlist('${productId}')"]`);
        wishlistBtns.forEach(btn => {
            btn.classList.toggle('active');
        });
    }

    loadMore() {
        const currentPage = this.stateManager.get('ui.currentPage');
        this.stateManager.set('ui.currentPage', currentPage + 1);
        this.eventBus.emit('products:filtered');
    }

    closeModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    decreaseQuantity() {
        const input = document.getElementById('productQuantity');
        const value = parseInt(input.value);
        if (value > 1) {
            input.value = value - 1;
        }
    }

    increaseQuantity(max) {
        const input = document.getElementById('productQuantity');
        const value = parseInt(input.value);
        if (value < max) {
            input.value = value + 1;
        }
    }
}