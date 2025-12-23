document.addEventListener('DOMContentLoaded', function() {
    console.log('Luxury Timepieces App Initializing...');
    
    // Initialize the application
    initApp();
});

function initApp() {
    // Application State
    const state = {
        currentImageIndex: 0,
        selectedColor: 'platinum',
        selectedMaterial: 'crocodile',
        quantity: 1,
        basePrice: 12500,
        cart: JSON.parse(localStorage.getItem('luxuryCart')) || [],
        wishlist: JSON.parse(localStorage.getItem('luxuryWishlist')) || []
    };

    // Product Images
    const productImages = [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
        'https://images.unsplash.com/photo-1547996160-81c5d6d7f8fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
        'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
        'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80'
    ];

    // Price adjustments
    const priceAdjustments = {
        colors: {
            platinum: 0,
            gold: 1500,
            black: 800,
            rose: 1200
        },
        materials: {
            crocodile: 0,
            steel: 500,
            carbon: 1200
        }
    };

    // DOM Elements
    const elements = {
        // Gallery
        mainImage: document.getElementById('mainProductImage'),
        zoomLens: document.getElementById('zoomLens'),
        zoomResult: document.getElementById('zoomResult'),
        thumbnails: document.querySelectorAll('.thumbnail'),
        currentImageSpan: document.getElementById('currentImage'),
        prevImageBtn: document.getElementById('prevImage'),
        nextImageBtn: document.getElementById('nextImage'),
        
        // Pricing
        currentPrice: document.getElementById('currentPrice'),
        totalPrice: document.getElementById('totalPrice'),
        colorPrice: document.getElementById('colorPrice'),
        materialPrice: document.getElementById('materialPrice'),
        btnPrice: document.querySelector('.btn-price'),
        
        // Options
        colorOptions: document.querySelectorAll('.color-option'),
        materialOptions: document.querySelectorAll('.material-option'),
        
        // Quantity
        quantityInput: document.getElementById('quantityInput'),
        decreaseQty: document.getElementById('decreaseQty'),
        increaseQty: document.getElementById('increaseQty'),
        
        // Cart
        cartBtn: document.getElementById('cartBtn'),
        cartCount: document.getElementById('cartCount'),
        cartSidebar: document.getElementById('cartSidebar'),
        cartOverlay: document.getElementById('cartOverlay'),
        closeCart: document.getElementById('closeCart'),
        cartBody: document.getElementById('cartBody'),
        cartSubtotal: document.getElementById('cartSubtotal'),
        cartTotal: document.getElementById('cartTotal'),
        sidebarCartCount: document.getElementById('sidebarCartCount'),
        
        // Wishlist
        wishlistBtn: document.getElementById('wishlistBtn'),
        wishlistCount: document.getElementById('wishlistCount'),
        addToWishlistBtn: document.getElementById('addToWishlistBtn'),
        
        // Buttons
        addToCartBtn: document.getElementById('addToCartBtn'),
        buyNowBtn: document.getElementById('buyNowBtn'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        browseCollection: document.getElementById('browseCollection'),
        
        // Toast
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        closeToast: document.getElementById('closeToast'),
        
        // Loading
        loadingOverlay: document.getElementById('loadingOverlay')
    };

    // Initialize the app
    init();

    function init() {
        console.log('Initializing Luxury Timepieces App...');
        
        // Update counts
        updateCartCount();
        updateWishlistCount();
        
        // Setup event listeners
        setupEventListeners();
        
        // Calculate initial price
        updatePrice();
        
        // Initialize image zoom
        initImageZoom();
        
        console.log('App initialized successfully!');
    }

    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Image Gallery
        elements.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => changeImage(index));
        });
        
        elements.prevImageBtn.addEventListener('click', () => changeImage(state.currentImageIndex - 1));
        elements.nextImageBtn.addEventListener('click', () => changeImage(state.currentImageIndex + 1));
        
        // Color Selection
        elements.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                state.selectedColor = color;
                updateActiveOption('color', option);
                updatePrice();
            });
        });
        
        // Material Selection
        elements.materialOptions.forEach(option => {
            option.addEventListener('click', () => {
                const material = option.dataset.material;
                state.selectedMaterial = material;
                updateActiveOption('material', option);
                updatePrice();
            });
        });
        
        // Quantity Controls
        elements.decreaseQty.addEventListener('click', () => {
            if (state.quantity > 1) {
                state.quantity--;
                elements.quantityInput.value = state.quantity;
                updatePrice();
            }
        });
        
        elements.increaseQty.addEventListener('click', () => {
            if (state.quantity < 3) {
                state.quantity++;
                elements.quantityInput.value = state.quantity;
                updatePrice();
            }
        });
        
        elements.quantityInput.addEventListener('change', (e) => {
            let qty = parseInt(e.target.value);
            if (isNaN(qty) || qty < 1) qty = 1;
            if (qty > 3) qty = 3;
            state.quantity = qty;
            e.target.value = qty;
            updatePrice();
        });
        
        // Cart Buttons
        elements.cartBtn.addEventListener('click', toggleCart);
        elements.closeCart.addEventListener('click', toggleCart);
        elements.cartOverlay.addEventListener('click', toggleCart);
        elements.browseCollection.addEventListener('click', toggleCart);
        
        // Add to Cart
        elements.addToCartBtn.addEventListener('click', addToCart);
        elements.buyNowBtn.addEventListener('click', buyNow);
        elements.checkoutBtn.addEventListener('click', checkout);
        
        // Wishlist
        elements.wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Wishlist feature coming soon!', 'info');
        });
        
        elements.addToWishlistBtn.addEventListener('click', toggleWishlist);
        
        // Toast
        elements.closeToast.addEventListener('click', hideToast);
        
        // Other buttons
        document.getElementById('compareBtn')?.addEventListener('click', () => {
            showToast('Added to comparison!', 'success');
        });
        
        document.getElementById('shareBtn')?.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'Chronomaster Elite Luxury Watch',
                    text: 'Check out this exquisite timepiece!',
                    url: window.location.href
                });
            } else {
                showToast('Link copied to clipboard!', 'success');
                navigator.clipboard.writeText(window.location.href);
            }
        });
        
        console.log('Event listeners setup complete');
    }

    // Image Gallery Functions
    function changeImage(index) {
        if (index < 0) index = productImages.length - 1;
        if (index >= productImages.length) index = 0;
        
        state.currentImageIndex = index;
        elements.mainImage.src = productImages[index];
        elements.currentImageSpan.textContent = index + 1;
        
        // Update active thumbnail
        elements.thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Price Calculation
    function updatePrice() {
        const colorPrice = priceAdjustments.colors[state.selectedColor] || 0;
        const materialPrice = priceAdjustments.materials[state.selectedMaterial] || 0;
        const unitPrice = state.basePrice + colorPrice + materialPrice;
        const totalPrice = unitPrice * state.quantity;
        
        // Update displays
        elements.currentPrice.textContent = `$${unitPrice.toLocaleString()}`;
        elements.totalPrice.textContent = `$${totalPrice.toLocaleString()}`;
        elements.btnPrice.textContent = `$${totalPrice.toLocaleString()}`;
        
        // Update breakdown
        elements.colorPrice.querySelector('span:last-child').textContent = 
            colorPrice > 0 ? `+$${colorPrice.toLocaleString()}` : '+$0';
        
        elements.materialPrice.querySelector('span:last-child').textContent = 
            materialPrice > 0 ? `+$${materialPrice.toLocaleString()}` : '+$0';
    }

    // Option Selection
    function updateActiveOption(type, selectedElement) {
        const options = type === 'color' ? elements.colorOptions : elements.materialOptions;
        options.forEach(option => option.classList.remove('active'));
        selectedElement.classList.add('active');
    }

    // Cart Functions
    function addToCart() {
        showLoading();
        
        setTimeout(() => {
            const colorPrice = priceAdjustments.colors[state.selectedColor] || 0;
            const materialPrice = priceAdjustments.materials[state.selectedMaterial] || 0;
            const unitPrice = state.basePrice + colorPrice + materialPrice;
            
            const cartItem = {
                id: Date.now(),
                name: 'Chronomaster Elite',
                color: state.selectedColor,
                colorName: getColorName(state.selectedColor),
                material: state.selectedMaterial,
                materialName: getMaterialName(state.selectedMaterial),
                quantity: state.quantity,
                price: unitPrice,
                total: unitPrice * state.quantity,
                image: productImages[0]
            };
            
            // Check if item already exists
            const existingIndex = state.cart.findIndex(item => 
                item.color === cartItem.color && item.material === cartItem.material
            );
            
            if (existingIndex > -1) {
                // Update quantity
                state.cart[existingIndex].quantity += cartItem.quantity;
                state.cart[existingIndex].total = state.cart[existingIndex].price * state.cart[existingIndex].quantity;
            } else {
                // Add new item
                state.cart.push(cartItem);
            }
            
            // Save to localStorage
            localStorage.setItem('luxuryCart', JSON.stringify(state.cart));
            
            // Update UI
            updateCartCount();
            renderCartItems();
            
            // Show success message
            hideLoading();
            showToast('Added to your luxury collection!', 'success');
            
            // Reset quantity
            state.quantity = 1;
            elements.quantityInput.value = 1;
            updatePrice();
            
            // Auto-open cart on mobile
            if (window.innerWidth <= 768) {
                toggleCart();
            }
        }, 800);
    }

    function buyNow() {
        addToCart();
        setTimeout(() => {
            toggleCart();
        }, 1000);
    }

    function checkout() {
        if (state.cart.length === 0) {
            showToast('Your collection is empty', 'info');
            return;
        }
        
        showLoading();
        setTimeout(() => {
            hideLoading();
            showToast('Proceeding to secure checkout...', 'success');
            // In a real app, you would redirect to checkout page
        }, 1500);
    }

    function updateCartCount() {
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        elements.sidebarCartCount.textContent = totalItems;
    }

    function renderCartItems() {
        if (state.cart.length === 0) {
            elements.cartBody.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h4>Your collection is empty</h4>
                    <p>Add exquisite timepieces to begin</p>
                    <button class="btn-outline" id="browseCollection">
                        <i class="fas fa-eye"></i> Browse Collection
                    </button>
                </div>
            `;
            
            // Re-attach event listener
            document.getElementById('browseCollection')?.addEventListener('click', toggleCart);
            
            elements.cartSubtotal.textContent = '$0.00';
            elements.cartTotal.textContent = '$0.00';
            return;
        }
        
        let cartHTML = '';
        let subtotal = 0;
        
        state.cart.forEach(item => {
            subtotal += item.total;
            
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-options">${item.colorName} • ${item.materialName}</div>
                        <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                        <div class="cart-item-actions">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        elements.cartBody.innerHTML = cartHTML;
        elements.cartSubtotal.textContent = `$${subtotal.toLocaleString()}`;
        elements.cartTotal.textContent = `$${subtotal.toLocaleString()}`;
        
        // Add event listeners to cart items
        setTimeout(() => {
            document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    updateCartItemQuantity(id, -1);
                });
            });
            
            document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    updateCartItemQuantity(id, 1);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    removeCartItem(id);
                });
            });
        }, 10);
    }

    function updateCartItemQuantity(itemId, change) {
        const itemIndex = state.cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        state.cart[itemIndex].quantity += change;
        
        // Ensure quantity is between 1 and 3
        if (state.cart[itemIndex].quantity < 1) state.cart[itemIndex].quantity = 1;
        if (state.cart[itemIndex].quantity > 3) state.cart[itemIndex].quantity = 3;
        
        // Update total
        state.cart[itemIndex].total = state.cart[itemIndex].price * state.cart[itemIndex].quantity;
        
        // Save and update
        localStorage.setItem('luxuryCart', JSON.stringify(state.cart));
        updateCartCount();
        renderCartItems();
    }

    function removeCartItem(itemId) {
        state.cart = state.cart.filter(item => item.id !== itemId);
        localStorage.setItem('luxuryCart', JSON.stringify(state.cart));
        updateCartCount();
        renderCartItems();
        showToast('Item removed from collection', 'info');
    }

    // Wishlist Functions
    function toggleWishlist() {
        const icon = elements.addToWishlistBtn.querySelector('i');
        const isInWishlist = icon.classList.contains('fas');
        
        if (isInWishlist) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            showToast('Removed from wishlist', 'info');
            
            // Remove from wishlist array
            const itemIndex = state.wishlist.findIndex(item => item.id === 'chronomaster-elite');
            if (itemIndex > -1) {
                state.wishlist.splice(itemIndex, 1);
            }
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            showToast('Added to wishlist', 'success');
            
            // Add to wishlist array
            state.wishlist.push({
                id: 'chronomaster-elite',
                name: 'Chronomaster Elite',
                price: state.basePrice
            });
        }
        
        localStorage.setItem('luxuryWishlist', JSON.stringify(state.wishlist));
        updateWishlistCount();
    }

    function updateWishlistCount() {
        elements.wishlistCount.textContent = state.wishlist.length;
    }

    // UI Functions
    function toggleCart() {
        elements.cartSidebar.classList.toggle('active');
        elements.cartOverlay.classList.toggle('active');
        
        if (elements.cartSidebar.classList.contains('active')) {
            renderCartItems();
        }
    }

    function showToast(message, type = 'success') {
        elements.toastMessage.textContent = message;
        
        // Set icon based on type
        const icon = elements.toast.querySelector('.toast-icon i');
        icon.className = type === 'success' ? 'fas fa-check-circle' :
                        type === 'info' ? 'fas fa-info-circle' :
                        'fas fa-exclamation-circle';
        
        // Set color based on type
        icon.style.color = type === 'success' ? '#4CAF50' :
                          type === 'info' ? '#2196F3' :
                          '#ff416c';
        
        elements.toast.classList.add('active');
        
        // Auto-hide after 5 seconds
        setTimeout(hideToast, 5000);
    }

    function hideToast() {
        elements.toast.classList.remove('active');
    }

    function showLoading() {
        elements.loadingOverlay.classList.add('active');
    }

    function hideLoading() {
        elements.loadingOverlay.classList.remove('active');
    }

    // Image Zoom Functionality
    function initImageZoom() {
        const zoomContainer = document.getElementById('zoomContainer');
        const lens = elements.zoomLens;
        const result = elements.zoomResult;
        const img = elements.mainImage;
        
        if (!zoomContainer || !lens || !result) return;
        
        // Calculate the ratio between result DIV and lens
        const cx = result.offsetWidth / lens.offsetWidth;
        const cy = result.offsetHeight / lens.offsetHeight;
        
        // Set background properties for the result DIV
        result.style.backgroundImage = `url('${img.src}')`;
        result.style.backgroundSize = `${img.width * cx}px ${img.height * cy}px`;
        
        // Event listeners for the lens
        zoomContainer.addEventListener('mousemove', moveLens);
        zoomContainer.addEventListener('mouseenter', () => {
            lens.style.opacity = '1';
            result.style.opacity = '1';
        });
        zoomContainer.addEventListener('mouseleave', () => {
            lens.style.opacity = '0';
            result.style.opacity = '0';
        });
        
        function moveLens(e) {
            e.preventDefault();
            
            // Get the cursor position relative to the image
            const rect = zoomContainer.getBoundingClientRect();
            let x = e.clientX - rect.left - lens.offsetWidth / 2;
            let y = e.clientY - rect.top - lens.offsetHeight / 2;
            
            // Prevent the lens from being positioned outside the image
            if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
            if (x < 0) x = 0;
            if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
            if (y < 0) y = 0;
            
            // Set the position of the lens
            lens.style.left = `${x}px`;
            lens.style.top = `${y}px`;
            
            // Display what the lens "sees"
            result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
        }
        
        // Update on image change
        img.addEventListener('load', () => {
            result.style.backgroundImage = `url('${img.src}')`;
            result.style.backgroundSize = `${img.width * cx}px ${img.height * cy}px`;
        });
    }

    // Helper Functions
    function getColorName(color) {
        const names = {
            platinum: 'Platinum Silver',
            gold: '18K Gold',
            black: 'Onyx Black',
            rose: 'Rose Gold'
        };
        return names[color] || color;
    }

    function getMaterialName(material) {
        const names = {
            crocodile: 'Italian Crocodile',
            steel: 'Stainless Steel',
            carbon: 'Carbon Fiber'
        };
        return names[material] || material;
    }

    // Public API (for debugging)
    window.app = {
        state,
        elements,
        addToCart,
        removeCartItem,
        toggleCart,
        showToast
    };
    
    console.log('Luxury Timepieces App Ready!');
}