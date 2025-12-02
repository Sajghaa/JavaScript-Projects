class ShoppingCartApp {
    constructor() {
        // App State
        this.cart = [];
        this.orders = [];
        this.products = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentStep = 1;
        this.appliedCoupon = null;
        this.coupons = {
            'SAVE10': 0.1,  // 10% off
            'SAVE20': 0.2,  // 20% off
            'FREESHIP': 'free-shipping', // Free shipping
            'WELCOME15': 0.15 // 15% off for new customers
        };
        
        // DOM Elements
        this.elements = {
            // Navigation
            productsLink: document.getElementById('productsLink'),
            cartLink: document.getElementById('cartLink'),
            ordersLink: document.getElementById('ordersLink'),
            cartCount: document.querySelector('.cart-count'),
            ordersCount: document.querySelector('.orders-count'),
            
            // Products Section
            productsSection: document.getElementById('productsSection'),
            productsGrid: document.getElementById('productsGrid'),
            categoryBtns: document.querySelectorAll('.category-btn'),
            totalProducts: document.getElementById('totalProducts'),
            
            // Cart Section
            cartSection: document.getElementById('cartSection'),
            cartItems: document.getElementById('cartItems'),
            emptyCart: document.getElementById('emptyCart'),
            clearCartBtn: document.getElementById('clearCartBtn'),
            continueShoppingBtn: document.getElementById('continueShoppingBtn'),
            browseProductsBtn: document.getElementById('browseProductsBtn'),
            
            // Cart Summary
            subtotal: document.getElementById('subtotal'),
            shipping: document.getElementById('shipping'),
            tax: document.getElementById('tax'),
            total: document.getElementById('total'),
            
            // Coupon
            couponCode: document.getElementById('couponCode'),
            applyCouponBtn: document.getElementById('applyCouponBtn'),
            couponMessage: document.getElementById('couponMessage'),
            checkoutBtn: document.getElementById('checkoutBtn'),
            
            // Orders Section
            ordersSection: document.getElementById('ordersSection'),
            ordersContainer: document.getElementById('ordersContainer'),
            emptyOrders: document.getElementById('emptyOrders'),
            
            // Checkout Modal
            checkoutModal: document.getElementById('checkoutModal'),
            checkoutForm: document.getElementById('checkoutForm'),
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            prevStepBtn: document.getElementById('prevStepBtn'),
            nextStepBtn: document.getElementById('nextStepBtn'),
            placeOrderBtn: document.getElementById('placeOrderBtn'),
            
            // Step 3 Elements
            shippingDetails: document.getElementById('shippingDetails'),
            paymentDetails: document.getElementById('paymentDetails'),
            orderItems: document.getElementById('orderItems'),
            orderSummary: document.getElementById('orderSummary'),
            
            // Success Modal
            successModal: document.getElementById('successModal'),
            orderId: document.getElementById('orderId'),
            deliveryDate: document.getElementById('deliveryDate'),
            orderTotal: document.getElementById('orderTotal'),
            viewOrderBtn: document.getElementById('viewOrderBtn'),
            continueShoppingSuccessBtn: document.getElementById('continueShoppingSuccessBtn'),
            
            // Quick View Modal
            quickViewModal: document.getElementById('quickViewModal'),
            quickViewContent: document.getElementById('quickViewContent'),
            
            // Theme Toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // Back to top
            backToTop: document.getElementById('backToTop')
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.loadCart();
        this.loadOrders();
        this.setupEventListeners();
        this.setupTheme();
        this.updateCartCount();
        this.updateOrdersCount();
    }
    
    setupEventListeners() {
        // Navigation
        this.elements.productsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showProductsSection();
        });
        
        this.elements.cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCartSection();
        });
        
        this.elements.ordersLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showOrdersSection();
        });
        
        // Category Filters
        this.elements.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterProductsByCategory(category);
                
                // Update active button
                this.elements.categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Cart Actions
        this.elements.clearCartBtn.addEventListener('click', () => this.clearCart());
        this.elements.continueShoppingBtn.addEventListener('click', () => this.showProductsSection());
        this.elements.browseProductsBtn.addEventListener('click', () => this.showProductsSection());
        
        // Coupon
        this.elements.applyCouponBtn.addEventListener('click', () => this.applyCoupon());
        this.elements.couponCode.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.applyCoupon();
            }
        });
        
        // Checkout
        this.elements.checkoutBtn.addEventListener('click', () => this.showCheckoutModal());
        
        // Checkout Modal Steps
        this.elements.prevStepBtn.addEventListener('click', () => this.prevStep());
        this.elements.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.elements.placeOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.placeOrder();
        });
        
        // Checkout Form Submission
        this.elements.checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.placeOrder();
        });
        
        // Payment Methods
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
        
        // Success Modal Actions
        this.elements.viewOrderBtn.addEventListener('click', () => {
            this.closeSuccessModal();
            this.showOrdersSection();
        });
        
        this.elements.continueShoppingSuccessBtn.addEventListener('click', () => {
            this.closeSuccessModal();
            this.showProductsSection();
        });
        
        // Modal Close Buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Modal Overlay Click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Back to top
        this.elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    loadProducts() {
        // Generate sample products
        this.products = this.generateSampleProducts();
        this.filteredProducts = [...this.products];
        this.renderProducts();
        this.elements.totalProducts.textContent = `${this.products.length}+`;
    }
    
    generateSampleProducts() {
        return [
            // Electronics
            {
                id: 1,
                name: "Wireless Bluetooth Headphones",
                category: "electronics",
                price: 89.99,
                originalPrice: 129.99,
                description: "Premium wireless headphones with noise cancellation and 30-hour battery life.",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
                rating: 4.5,
                ratingCount: 1247,
                badge: "sale",
                specs: {
                    "Battery Life": "30 hours",
                    "Connectivity": "Bluetooth 5.0",
                    "Noise Cancellation": "Yes",
                    "Water Resistance": "IPX4"
                }
            },
            {
                id: 2,
                name: "Smart Watch Series 5",
                category: "electronics",
                price: 299.99,
                originalPrice: null,
                description: "Advanced smartwatch with health monitoring and GPS tracking.",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
                rating: 4.7,
                ratingCount: 892,
                badge: "new",
                specs: {
                    "Display": "AMOLED",
                    "Battery": "2 days",
                    "GPS": "Built-in",
                    "Waterproof": "50m"
                }
            },
            {
                id: 3,
                name: "Laptop Pro 14\"",
                category: "electronics",
                price: 1299.99,
                originalPrice: 1499.99,
                description: "Professional laptop with high-performance processor and stunning display.",
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
                rating: 4.8,
                ratingCount: 567,
                badge: "popular",
                specs: {
                    "Processor": "Intel i7",
                    "RAM": "16GB",
                    "Storage": "512GB SSD",
                    "Display": "14\" Retina"
                }
            },
            {
                id: 4,
                name: "Wireless Earbuds",
                category: "electronics",
                price: 59.99,
                originalPrice: 79.99,
                description: "True wireless earbuds with charging case and touch controls.",
                image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
                rating: 4.3,
                ratingCount: 2103,
                badge: "sale",
                specs: {
                    "Battery Life": "6 hours",
                    "Case Battery": "24 hours",
                    "Waterproof": "IPX5",
                    "Touch Controls": "Yes"
                }
            },
            
            // Clothing
            {
                id: 5,
                name: "Premium Cotton T-Shirt",
                category: "clothing",
                price: 29.99,
                originalPrice: null,
                description: "100% organic cotton t-shirt with modern fit and premium finish.",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
                rating: 4.6,
                ratingCount: 456,
                badge: null,
                specs: {
                    "Material": "100% Cotton",
                    "Fit": "Regular",
                    "Care": "Machine wash",
                    "Origin": "Made in USA"
                }
            },
            {
                id: 6,
                name: "Designer Denim Jacket",
                category: "clothing",
                price: 89.99,
                originalPrice: 119.99,
                description: "Classic denim jacket with modern tailoring and premium hardware.",
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
                rating: 4.4,
                ratingCount: 189,
                badge: "sale",
                specs: {
                    "Material": "100% Denim",
                    "Fit": "Slim",
                    "Pockets": "4",
                    "Closure": "Button"
                }
            },
            {
                id: 7,
                name: "Running Shoes",
                category: "clothing",
                price: 79.99,
                originalPrice: null,
                description: "Lightweight running shoes with responsive cushioning and breathable upper.",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
                rating: 4.7,
                ratingCount: 1204,
                badge: "popular",
                specs: {
                    "Type": "Running",
                    "Cushioning": "Responsive",
                    "Weight": "250g",
                    "Surface": "Road/Trail"
                }
            },
            
            // Home & Kitchen
            {
                id: 8,
                name: "Smart Coffee Maker",
                category: "home",
                price: 149.99,
                originalPrice: 199.99,
                description: "Programmable coffee maker with smartphone control and built-in grinder.",
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
                rating: 4.5,
                ratingCount: 678,
                badge: "sale",
                specs: {
                    "Capacity": "12 cups",
                    "Programmable": "Yes",
                    "WiFi": "Built-in",
                    "Grinder": "Integrated"
                }
            },
            {
                id: 9,
                name: "Air Purifier",
                category: "home",
                price: 199.99,
                originalPrice: null,
                description: "HEPA air purifier with smart sensors and whisper-quiet operation.",
                image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop",
                rating: 4.6,
                ratingCount: 432,
                badge: "new",
                specs: {
                    "Coverage": "500 sq ft",
                    "Filter Type": "HEPA",
                    "Noise Level": "25 dB",
                    "Smart Sensors": "Yes"
                }
            },
            {
                id: 10,
                name: "Ceramic Cookware Set",
                category: "home",
                price: 129.99,
                originalPrice: 179.99,
                description: "10-piece ceramic non-stick cookware set with heat-resistant handles.",
                image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
                rating: 4.4,
                ratingCount: 321,
                badge: null,
                specs: {
                    "Pieces": "10",
                    "Material": "Ceramic",
                    "Non-stick": "Yes",
                    "Oven Safe": "Up to 450°F"
                }
            },
            
            // Books
            {
                id: 11,
                name: "JavaScript Mastery",
                category: "books",
                price: 34.99,
                originalPrice: null,
                description: "Complete guide to modern JavaScript development with practical examples.",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
                rating: 4.8,
                ratingCount: 789,
                badge: "popular",
                specs: {
                    "Pages": "450",
                    "Format": "Paperback",
                    "Level": "Intermediate",
                    "Publisher": "Tech Press"
                }
            },
            {
                id: 12,
                name: "Design Thinking Guide",
                category: "books",
                price: 27.99,
                originalPrice: 34.99,
                description: "Learn design thinking methodologies for product development and innovation.",
                image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop",
                rating: 4.6,
                ratingCount: 234,
                badge: "sale",
                specs: {
                    "Pages": "320",
                    "Format": "Hardcover",
                    "Author": "Jane Smith",
                    "Publisher": "Design House"
                }
            }
        ];
    }
    
    filterProductsByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => product.category === category);
        }
        
        this.renderProducts();
    }
    
    renderProducts() {
        this.elements.productsGrid.innerHTML = '';
        
        this.filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.productsGrid.appendChild(productCard);
        });
    }
    
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        // Format price
        const priceFormatted = this.formatPrice(product.price);
        const originalPriceFormatted = product.originalPrice ? this.formatPrice(product.originalPrice) : null;
        
        // Generate star rating
        const stars = this.generateStarRating(product.rating);
        
        card.innerHTML = `
            ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge.toUpperCase()}</span>` : ''}
            
            <img src="${product.image}" alt="${product.name}" class="product-image">
            
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-price">
                    <span class="current-price">${priceFormatted}</span>
                    ${originalPriceFormatted ? `<span class="original-price">${originalPriceFormatted}</span>` : ''}
                </div>
                
                <div class="product-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-count">(${product.ratingCount})</span>
                </div>
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="shoppingCart.addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="quick-view-btn" onclick="shoppingCart.showQuickView(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    showQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const priceFormatted = this.formatPrice(product.price);
        const originalPriceFormatted = product.originalPrice ? this.formatPrice(product.originalPrice) : null;
        const stars = this.generateStarRating(product.rating);
        
        // Generate specs HTML
        const specsHtml = Object.entries(product.specs || {}).map(([key, value]) => `
            <div class="spec-item">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
            </div>
        `).join('');
        
        this.elements.quickViewContent.innerHTML = `
            <div class="quick-view-content">
                <img src="${product.image}" alt="${product.name}" class="quick-view-image">
                
                <div class="quick-view-details">
                    <h2 class="quick-view-title">${product.name}</h2>
                    <div class="product-category">${product.category}</div>
                    
                    <div class="product-price">
                        <span class="current-price">${priceFormatted}</span>
                        ${originalPriceFormatted ? `<span class="original-price">${originalPriceFormatted}</span>` : ''}
                    </div>
                    
                    <div class="product-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-count">${product.rating} (${product.ratingCount} reviews)</span>
                    </div>
                    
                    <p class="quick-view-description">${product.description}</p>
                    
                    ${specsHtml ? `
                        <div class="quick-view-specs">
                            ${specsHtml}
                        </div>
                    ` : ''}
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="shoppingCart.addToCart(${product.id}); shoppingCart.closeAllModals()">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(this.elements.quickViewModal);
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
        
        // Show feedback
        this.showAddToCartFeedback(product.name);
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartDisplay();
    }
    
    updateCartItemQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        if (newQuantity < 1) {
            this.removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            this.updateCartDisplay();
        }
    }
    
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartCount();
            this.updateCartDisplay();
            this.appliedCoupon = null;
            this.elements.couponCode.value = '';
            this.elements.couponMessage.textContent = '';
            this.elements.couponMessage.className = 'coupon-message';
        }
    }
    
    updateCartDisplay() {
        // Show/hide empty cart message
        if (this.cart.length === 0) {
            this.elements.emptyCart.style.display = 'block';
            this.elements.cartItems.innerHTML = '';
        } else {
            this.elements.emptyCart.style.display = 'none';
            this.renderCartItems();
        }
        
        // Update summary
        this.updateCartSummary();
    }
    
    renderCartItems() {
        this.elements.cartItems.innerHTML = '';
        
        this.cart.forEach(item => {
            const cartItem = this.createCartItemElement(item);
            this.elements.cartItems.appendChild(cartItem);
        });
    }
    
    createCartItemElement(item) {
        const element = document.createElement('div');
        element.className = 'cart-item';
        element.dataset.id = item.id;
        
        const itemTotal = item.price * item.quantity;
        const priceFormatted = this.formatPrice(item.price);
        const totalFormatted = this.formatPrice(itemTotal);
        
        element.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-category">${item.category}</div>
                <div class="cart-item-price">${priceFormatted} each</div>
                
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="shoppingCart.updateCartItemQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="shoppingCart.updateCartItemQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <button class="remove-item-btn" onclick="shoppingCart.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            
            <div class="cart-item-total">${totalFormatted}</div>
        `;
        
        return element;
    }
    
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 || (this.appliedCoupon && this.appliedCoupon.type === 'free-shipping') ? 0 : 5.99;
        const tax = subtotal * 0.08; // 8% tax
        let total = subtotal + shipping + tax;
        
        // Apply coupon discount if applicable
        if (this.appliedCoupon && this.appliedCoupon.type === 'percentage') {
            const discount = subtotal * this.appliedCoupon.value;
            total -= discount;
        }
        
        this.elements.subtotal.textContent = this.formatPrice(subtotal);
        this.elements.shipping.textContent = shipping === 0 ? 'FREE' : this.formatPrice(shipping);
        this.elements.tax.textContent = this.formatPrice(tax);
        this.elements.total.textContent = this.formatPrice(total);
    }
    
    applyCoupon() {
        const code = this.elements.couponCode.value.trim().toUpperCase();
        
        if (!code) {
            this.showCouponMessage('Please enter a coupon code', 'error');
            return;
        }
        
        if (!this.coupons[code]) {
            this.showCouponMessage('Invalid coupon code', 'error');
            return;
        }
        
        const couponValue = this.coupons[code];
        
        if (couponValue === 'free-shipping') {
            this.appliedCoupon = {
                code,
                type: 'free-shipping',
                value: couponValue
            };
            this.showCouponMessage('Free shipping applied!', 'success');
        } else if (typeof couponValue === 'number') {
            this.appliedCoupon = {
                code,
                type: 'percentage',
                value: couponValue
            };
            const discountPercent = couponValue * 100;
            this.showCouponMessage(`${discountPercent}% discount applied!`, 'success');
        }
        
        this.updateCartSummary();
        this.elements.couponCode.value = '';
    }
    
    showCouponMessage(message, type) {
        this.elements.couponMessage.textContent = message;
        this.elements.couponMessage.className = `coupon-message ${type}`;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            this.elements.couponMessage.textContent = '';
            this.elements.couponMessage.className = 'coupon-message';
        }, 3000);
    }
    
    showCheckoutModal() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        this.currentStep = 1;
        this.updateCheckoutSteps();
        this.showModal(this.elements.checkoutModal);
    }
    
    updateCheckoutSteps() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update step content
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update button visibility
        this.elements.prevStepBtn.style.display = this.currentStep > 1 ? 'flex' : 'none';
        this.elements.nextStepBtn.style.display = this.currentStep < 3 ? 'flex' : 'none';
        this.elements.placeOrderBtn.style.display = this.currentStep === 3 ? 'flex' : 'none';
        
        // Update step 3 content
        if (this.currentStep === 3) {
            this.updateOrderReview();
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateCheckoutSteps();
        }
    }
    
    nextStep() {
        // Validate current step before proceeding
        if (!this.validateCurrentStep()) {
            return;
        }
        
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateCheckoutSteps();
        }
    }
    
    validateCurrentStep() {
        if (this.currentStep === 1) {
            // Validate shipping information
            const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
            let isValid = true;
            
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    field.style.borderColor = 'var(--danger-color)';
                    isValid = false;
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                alert('Please fill in all required fields');
                return false;
            }
            
            // Validate email format
            const email = document.getElementById('email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                document.getElementById('email').style.borderColor = 'var(--danger-color)';
                return false;
            }
            
            return true;
        }
        
        if (this.currentStep === 2) {
            // Validate payment information
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardName = document.getElementById('cardName').value;
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            
            if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
                alert('Please enter a valid 16-digit card number');
                return false;
            }
            
            if (!cardName.trim()) {
                alert('Please enter the name on the card');
                return false;
            }
            
            if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
                alert('Please enter a valid expiry date (MM/YY)');
                return false;
            }
            
            if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
                alert('Please enter a valid 3-digit CVV');
                return false;
            }
            
            return true;
        }
        
        if (this.currentStep === 3) {
            // Validate terms agreement
            if (!document.getElementById('agreeTerms').checked) {
                alert('Please agree to the terms and conditions');
                return false;
            }
            
            return true;
        }
        
        return true;
    }
    
    updateOrderReview() {
        // Shipping details
        const shippingDetails = `
            <p><strong>${document.getElementById('fullName').value}</strong></p>
            <p>${document.getElementById('address').value}</p>
            <p>${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}</p>
            <p>${document.getElementById('email').value}</p>
            <p>${document.getElementById('phone').value}</p>
        `;
        this.elements.shippingDetails.innerHTML = shippingDetails;
        
        // Payment details
        const cardNumber = document.getElementById('cardNumber').value;
        const lastFour = cardNumber.slice(-4);
        this.elements.paymentDetails.innerHTML = `
            <p><strong>Credit Card</strong> ending in ${lastFour}</p>
            <p>Expires: ${document.getElementById('expiry').value}</p>
        `;
        
        // Order items
        const orderItemsHtml = this.cart.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-details">
                    <div class="order-item-title">${item.name}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">${this.formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');
        this.elements.orderItems.innerHTML = orderItemsHtml;
        
        // Order summary
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 || (this.appliedCoupon && this.appliedCoupon.type === 'free-shipping') ? 0 : 5.99;
        const tax = subtotal * 0.08;
        let total = subtotal + shipping + tax;
        
        if (this.appliedCoupon && this.appliedCoupon.type === 'percentage') {
            const discount = subtotal * this.appliedCoupon.value;
            total -= discount;
        }
        
        this.elements.orderSummary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>${this.formatPrice(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>${shipping === 0 ? 'FREE' : this.formatPrice(shipping)}</span>
            </div>
            ${this.appliedCoupon && this.appliedCoupon.type === 'percentage' ? `
                <div class="summary-row">
                    <span>Discount (${this.appliedCoupon.code})</span>
                    <span>-${this.formatPrice(subtotal * this.appliedCoupon.value)}</span>
                </div>
            ` : ''}
            <div class="summary-row">
                <span>Tax</span>
                <span>${this.formatPrice(tax)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>${this.formatPrice(total)}</span>
            </div>
        `;
    }
    
    placeOrder() {
        // Create order object
        const orderId = 'SHOP-' + Date.now().toString().slice(-6);
        const orderDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 || (this.appliedCoupon && this.appliedCoupon.type === 'free-shipping') ? 0 : 5.99;
        const tax = subtotal * 0.08;
        let total = subtotal + shipping + tax;
        
        if (this.appliedCoupon && this.appliedCoupon.type === 'percentage') {
            const discount = subtotal * this.appliedCoupon.value;
            total -= discount;
        }
        
        const order = {
            id: orderId,
            date: orderDate,
            status: 'processing',
            items: [...this.cart],
            shipping: {
                name: document.getElementById('fullName').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            },
            payment: {
                method: 'Credit Card',
                lastFour: document.getElementById('cardNumber').value.slice(-4)
            },
            summary: {
                subtotal,
                shipping,
                tax,
                discount: this.appliedCoupon && this.appliedCoupon.type === 'percentage' ? subtotal * this.appliedCoupon.value : 0,
                total
            }
        };
        
        // Add to orders
        this.orders.unshift(order);
        this.saveOrders();
        this.updateOrdersCount();
        
        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        this.appliedCoupon = null;
        
        // Update success modal
        this.elements.orderId.textContent = orderId;
        this.elements.orderTotal.textContent = this.formatPrice(total);
        
        // Calculate delivery date (3-5 business days)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 4); // Add 4 days for 3-5 business days
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.elements.deliveryDate.textContent = formattedDeliveryDate;
        
        // Close checkout modal and show success modal
        this.closeAllModals();
        this.showModal(this.elements.successModal);
    }
    
    showOrdersSection() {
        this.hideAllSections();
        this.elements.ordersSection.style.display = 'block';
        this.updateActiveNav('orders');
        this.renderOrders();
    }
    
    renderOrders() {
        if (this.orders.length === 0) {
            this.elements.emptyOrders.style.display = 'block';
            this.elements.ordersContainer.innerHTML = '';
            return;
        }
        
        this.elements.emptyOrders.style.display = 'none';
        this.elements.ordersContainer.innerHTML = '';
        
        this.orders.forEach(order => {
            const orderCard = this.createOrderCard(order);
            this.elements.ordersContainer.appendChild(orderCard);
        });
    }
    
    createOrderCard(order) {
        const element = document.createElement('div');
        element.className = 'order-card';
        
        const itemsHtml = order.items.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-details">
                    <div class="order-item-title">${item.name}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">${this.formatPrice(item.price * item.quantity)}</div>
            </div>
        `).join('');
        
        element.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">${order.id}</span>
                    <div class="order-date">${order.date}</div>
                </div>
                <span class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            
            <div class="order-items">
                ${itemsHtml}
            </div>
            
            <div class="order-footer">
                <div class="order-total">${this.formatPrice(order.summary.total)}</div>
                <div class="order-actions">
                    <button class="btn btn-secondary" onclick="shoppingCart.viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
        
        return element;
    }
    
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // In a real app, this would show a detailed order view
        alert(`Order ${orderId}\nStatus: ${order.status}\nTotal: ${this.formatPrice(order.summary.total)}\nItems: ${order.items.length}`);
    }
    
    showProductsSection() {
        this.hideAllSections();
        this.elements.productsSection.style.display = 'block';
        this.updateActiveNav('products');
    }
    
    showCartSection() {
        this.hideAllSections();
        this.elements.cartSection.style.display = 'block';
        this.updateActiveNav('cart');
        this.updateCartDisplay();
    }
    
    hideAllSections() {
        this.elements.productsSection.style.display = 'none';
        this.elements.cartSection.style.display = 'none';
        this.elements.ordersSection.style.display = 'none';
    }
    
    updateActiveNav(section) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById(`${section}Link`).classList.add('active');
    }
    
    showAddToCartFeedback(productName) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'add-to-cart-feedback';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} added to cart!</span>
        `;
        
        // Style the feedback
        feedback.style.position = 'fixed';
        feedback.style.top = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = 'var(--success-color)';
        feedback.style.color = 'white';
        feedback.style.padding = '15px 20px';
        feedback.style.borderRadius = 'var(--border-radius-sm)';
        feedback.style.boxShadow = 'var(--card-shadow)';
        feedback.style.zIndex = '9999';
        feedback.style.display = 'flex';
        feedback.style.alignItems = 'center';
        feedback.style.gap = '10px';
        feedback.style.animation = 'slideIn 0.3s ease';
        
        // Add to document
        document.body.appendChild(feedback);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
        
        // Add CSS animations
        if (!document.getElementById('feedback-animations')) {
            const style = document.createElement('style');
            style.id = 'feedback-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    closeAllModals() {
        this.closeModal(this.elements.checkoutModal);
        this.closeModal(this.elements.successModal);
        this.closeModal(this.elements.quickViewModal);
    }
    
    // Local Storage Management
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }
    
    saveOrders() {
        localStorage.setItem('shoppingOrders', JSON.stringify(this.orders));
    }
    
    loadOrders() {
        const savedOrders = localStorage.getItem('shoppingOrders');
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        }
    }
    
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.elements.cartCount.textContent = totalItems;
    }
    
    updateOrdersCount() {
        this.elements.ordersCount.textContent = this.orders.length;
    }
    
    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('shoppingTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('shoppingTheme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Utility Methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    }
    
    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = new ShoppingCartApp();
});