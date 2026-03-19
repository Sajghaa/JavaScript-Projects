export class ProductCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(product) {
        const isInWishlist = this.stateManager.isInWishlist(product.id);
        const discount = product.oldPrice ? 
            Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.oldPrice ? `
                    <div class="product-badge sale">-${discount}%</div>
                ` : ''}
                ${product.featured ? `
                    <div class="product-badge new">Featured</div>
                ` : ''}
                
                <img src="${product.images[0]}" alt="${product.name}" class="product-image" 
                     onclick="viewProduct('${product.id}')" style="cursor: pointer;">
                
                <div class="product-info">
                    <h3 class="product-title" onclick="viewProduct('${product.id}')" style="cursor: pointer;">
                        ${product.name}
                    </h3>
                    
                    <div class="product-category">
                        ${product.brand} • ${product.subCategory}
                    </div>
                    
                    <div class="product-rating">
                        <div class="stars">
                            ${this.renderStars(product.rating)}
                        </div>
                        <span class="rating-count">(${product.reviews})</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `
                            <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
                        ` : ''}
                    </div>
                    
                    <button class="add-to-cart-btn" onclick="addToCart('${product.id}')"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                            onclick="app.productManager.toggleWishlist('${product.id}')"
                            style="position: absolute; top: 10px; right: 10px; background: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                        <i class="fas fa-heart" style="color: ${isInWishlist ? '#ef4444' : '#6b7280'};"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star" style="color: #f59e0b;"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt" style="color: #f59e0b;"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star" style="color: #f59e0b;"></i>';
        }
        
        return stars;
    }
}