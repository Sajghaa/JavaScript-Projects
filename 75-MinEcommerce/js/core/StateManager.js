export class StateManager {
    constructor() {
        this.state = {
            products: [],
            categories: [],
            cart: [],
            wishlist: [],
            orders: [],
            currentUser: null,
            filters: {
                category: 'all',
                priceRange: { min: 0, max: 1000 },
                ratings: null,
                inStock: false,
                sortBy: 'featured'
            },
            search: {
                query: '',
                results: []
            },
            ui: {
                currentView: 'products',
                cartOpen: false,
                modalOpen: null,
                loading: false,
                theme: 'light',
                viewMode: 'grid',
                itemsPerPage: 12,
                currentPage: 1
            }
        };

        this.listeners = new Map();
        this.loadFromStorage();
        this.initializeSampleData();
    }

    // Initialize sample products
    initializeSampleData() {
        if (this.state.products.length === 0) {
            this.state.products = [
                {
                    id: 'prod_1',
                    name: 'Wireless Headphones',
                    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and frequent travelers.',
                    price: 199.99,
                    oldPrice: 249.99,
                    category: 'electronics',
                    subCategory: 'audio',
                    images: [
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500'
                    ],
                    rating: 4.5,
                    reviews: 234,
                    inStock: true,
                    stockCount: 45,
                    brand: 'SoundMaster',
                    tags: ['wireless', 'bluetooth', 'noise-cancelling'],
                    featured: true,
                    createdAt: '2024-01-15'
                },
                {
                    id: 'prod_2',
                    name: 'Smart Watch Series 5',
                    description: 'Track your fitness, receive notifications, and more with this advanced smart watch. Includes heart rate monitor and GPS.',
                    price: 299.99,
                    oldPrice: 349.99,
                    category: 'electronics',
                    subCategory: 'wearables',
                    images: [
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500'
                    ],
                    rating: 4.3,
                    reviews: 156,
                    inStock: true,
                    stockCount: 28,
                    brand: 'TechWear',
                    tags: ['smartwatch', 'fitness', 'gps'],
                    featured: true,
                    createdAt: '2024-01-20'
                },
                {
                    id: 'prod_3',
                    name: 'Classic Cotton T-Shirt',
                    description: 'Comfortable 100% cotton t-shirt, perfect for everyday wear. Available in multiple colors.',
                    price: 24.99,
                    oldPrice: 29.99,
                    category: 'clothing',
                    subCategory: 'mens',
                    images: [
                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
                    ],
                    rating: 4.7,
                    reviews: 89,
                    inStock: true,
                    stockCount: 120,
                    brand: 'ComfortWear',
                    tags: ['cotton', 'casual', 't-shirt'],
                    featured: false,
                    colors: ['Black', 'White', 'Navy', 'Gray'],
                    sizes: ['S', 'M', 'L', 'XL'],
                    createdAt: '2024-02-01'
                },
                {
                    id: 'prod_4',
                    name: 'Professional Blender',
                    description: 'High-speed blender perfect for smoothies, soups, and more. 1000W motor and durable stainless steel blades.',
                    price: 89.99,
                    oldPrice: 119.99,
                    category: 'home',
                    subCategory: 'kitchen',
                    images: [
                        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
                        'https://images.unsplash.com/photo-1574317580882-4cdc9a5cbc5f?w=500'
                    ],
                    rating: 4.4,
                    reviews: 67,
                    inStock: true,
                    stockCount: 15,
                    brand: 'KitchenPro',
                    tags: ['blender', 'kitchen', 'appliance'],
                    featured: true,
                    createdAt: '2024-02-10'
                },
                {
                    id: 'prod_5',
                    name: 'Yoga Mat Premium',
                    description: 'Non-slip exercise mat perfect for yoga, pilates, and workouts. Eco-friendly material with carrying strap.',
                    price: 39.99,
                    oldPrice: 49.99,
                    category: 'sports',
                    subCategory: 'fitness',
                    images: [
                        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
                        'https://images.unsplash.com/photo-1592432675946-3a5e25f6ab5d?w=500'
                    ],
                    rating: 4.8,
                    reviews: 112,
                    inStock: true,
                    stockCount: 50,
                    brand: 'FlexFit',
                    tags: ['yoga', 'fitness', 'exercise'],
                    featured: false,
                    colors: ['Purple', 'Blue', 'Black'],
                    createdAt: '2024-02-15'
                },
                {
                    id: 'prod_6',
                    name: 'Leather Wallet',
                    description: 'Genuine leather wallet with multiple card slots and RFID blocking technology.',
                    price: 49.99,
                    oldPrice: 59.99,
                    category: 'accessories',
                    subCategory: 'wallets',
                    images: [
                        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
                        'https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=500'
                    ],
                    rating: 4.6,
                    reviews: 45,
                    inStock: true,
                    stockCount: 32,
                    brand: 'LeatherCraft',
                    tags: ['leather', 'wallet', 'accessories'],
                    featured: false,
                    colors: ['Brown', 'Black'],
                    createdAt: '2024-02-20'
                },
                {
                    id: 'prod_7',
                    name: 'Coffee Maker',
                    description: 'Programmable coffee maker with 12-cup capacity. Features auto-brew and keep-warm function.',
                    price: 79.99,
                    oldPrice: 99.99,
                    category: 'home',
                    subCategory: 'kitchen',
                    images: [
                        'https://images.unsplash.com/photo-1517668808822-9ebb7f1a4e3e?w=500',
                        'https://images.unsplash.com/photo-1520975661595-6453be495343?w=500'
                    ],
                    rating: 4.2,
                    reviews: 78,
                    inStock: true,
                    stockCount: 23,
                    brand: 'BrewMaster',
                    tags: ['coffee', 'kitchen', 'appliance'],
                    featured: true,
                    createdAt: '2024-02-25'
                },
                {
                    id: 'prod_8',
                    name: 'Running Shoes',
                    description: 'Lightweight running shoes with responsive cushioning. Perfect for daily runs and marathons.',
                    price: 129.99,
                    oldPrice: 159.99,
                    category: 'footwear',
                    subCategory: 'running',
                    images: [
                        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
                    ],
                    rating: 4.7,
                    reviews: 156,
                    inStock: true,
                    stockCount: 40,
                    brand: 'SportFlex',
                    tags: ['running', 'shoes', 'sports'],
                    featured: true,
                    colors: ['Red', 'Blue', 'Black'],
                    sizes: ['7', '8', '9', '10', '11'],
                    createdAt: '2024-03-01'
                }
            ];

            this.state.categories = [
                { id: 'all', name: 'All Products', count: this.state.products.length },
                { id: 'electronics', name: 'Electronics', count: this.state.products.filter(p => p.category === 'electronics').length },
                { id: 'clothing', name: 'Clothing', count: this.state.products.filter(p => p.category === 'clothing').length },
                { id: 'home', name: 'Home & Kitchen', count: this.state.products.filter(p => p.category === 'home').length },
                { id: 'sports', name: 'Sports & Outdoors', count: this.state.products.filter(p => p.category === 'sports').length },
                { id: 'accessories', name: 'Accessories', count: this.state.products.filter(p => p.category === 'accessories').length },
                { id: 'footwear', name: 'Footwear', count: this.state.products.filter(p => p.category === 'footwear').length }
            ];
        }
    }

    // Get state
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    // Set state
    set(path, value, notify = true) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        const oldValue = target[lastKey];
        
        target[lastKey] = value;
        
        if (notify) {
            this.notifyListeners(path, value, oldValue);
            this.saveToStorage();
        }
    }

    // Subscribe to changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        return () => {
            this.listeners.get(path)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                cart: this.state.cart,
                wishlist: this.state.wishlist,
                orders: this.state.orders,
                currentUser: this.state.currentUser,
                ui: this.state.ui
            };
            localStorage.setItem('ecommerce_state', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('ecommerce_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.cart = data.cart || [];
                this.state.wishlist = data.wishlist || [];
                this.state.orders = data.orders || [];
                this.state.currentUser = data.currentUser || null;
                this.state.ui = { ...this.state.ui, ...data.ui };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Product operations
    getProduct(productId) {
        return this.state.products.find(p => p.id === productId);
    }

    getFilteredProducts() {
        let products = [...this.state.products];
        const filters = this.state.filters;
        const search = this.state.search;

        // Apply search filter
        if (search.query) {
            const query = search.query.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            products = products.filter(p => p.category === filters.category);
        }

        // Apply price range filter
        products = products.filter(p => 
            p.price >= filters.priceRange.min && 
            p.price <= filters.priceRange.max
        );

        // Apply rating filter
        if (filters.ratings) {
            products = products.filter(p => p.rating >= filters.ratings);
        }

        // Apply stock filter
        if (filters.inStock) {
            products = products.filter(p => p.inStock);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-low':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'rating':
                products.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Featured - new arrivals first
                products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return products;
    }

    getPaginatedProducts() {
        const filtered = this.getFilteredProducts();
        const { currentPage, itemsPerPage } = this.state.ui;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        return {
            products: filtered.slice(start, end),
            total: filtered.length,
            hasMore: end < filtered.length
        };
    }

    // Cart operations
    addToCart(productId, quantity = 1, options = {}) {
        const product = this.getProduct(productId);
        if (!product) return false;

        const cart = [...this.state.cart];
        const existingItem = cart.find(item => 
            item.id === productId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity,
                options,
                addedAt: new Date().toISOString()
            });
        }

        this.set('cart', cart);
        return true;
    }

    updateCartItem(productId, quantity, options = {}) {
        const cart = [...this.state.cart];
        const itemIndex = cart.findIndex(item => 
            item.id === productId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (itemIndex !== -1) {
            if (quantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = quantity;
            }
            this.set('cart', cart);
            return true;
        }
        return false;
    }

    removeFromCart(productId, options = {}) {
        const cart = this.state.cart.filter(item => 
            !(item.id === productId && JSON.stringify(item.options) === JSON.stringify(options))
        );
        this.set('cart', cart);
    }

    clearCart() {
        this.set('cart', []);
    }

    getCartTotal() {
        return this.state.cart.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    }

    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Wishlist operations
    addToWishlist(productId) {
        if (!this.state.wishlist.includes(productId)) {
            const wishlist = [...this.state.wishlist, productId];
            this.set('wishlist', wishlist);
            return true;
        }
        return false;
    }

    removeFromWishlist(productId) {
        const wishlist = this.state.wishlist.filter(id => id !== productId);
        this.set('wishlist', wishlist);
    }

    isInWishlist(productId) {
        return this.state.wishlist.includes(productId);
    }

    // Order operations
    createOrder(orderData) {
        const order = {
            id: 'ORD' + Date.now().toString(36).toUpperCase(),
            ...orderData,
            items: [...this.state.cart],
            total: this.getCartTotal(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const orders = [...this.state.orders, order];
        this.set('orders', orders);
        this.clearCart();
        
        return order;
    }

    getUserOrders() {
        if (!this.state.currentUser) return [];
        return this.state.orders.filter(o => o.userId === this.state.currentUser.id);
    }

    // Filter operations
    setFilter(filterType, value) {
        const filters = { ...this.state.filters, [filterType]: value };
        this.set('filters', filters);
        this.set('ui.currentPage', 1); // Reset to first page when filter changes
    }

    resetFilters() {
        this.set('filters', {
            category: 'all',
            priceRange: { min: 0, max: 1000 },
            ratings: null,
            inStock: false,
            sortBy: 'featured'
        });
    }

    // Search operations
    search(query) {
        this.set('search.query', query);
        this.set('ui.currentPage', 1);
        return this.getFilteredProducts();
    }

    // User operations
    login(email, password) {
        // Simulate login - in real app, this would be an API call
        const user = {
            id: 'user_1',
            name: 'John Doe',
            email: email,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
        };
        this.set('currentUser', user);
        return user;
    }

    logout() {
        this.set('currentUser', null);
    }
}