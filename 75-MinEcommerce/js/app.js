import { StateManager } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { StorageManager } from './core/StorageManager.js';
import { ProductManager } from './modules/ProductManager.js';
import { CartManager } from './modules/CartManager.js';
import { CheckoutManager } from './modules/CheckoutManager.js';
import { CategoryManager } from './modules/CategoryManager.js';
import { SearchManager } from './modules/SearchManager.js';
import { FilterManager } from './modules/FilterManager.js';
import { UserManager } from './modules/UserManager.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductGrid } from './components/ProductGrid.js';
import { CartSidebar } from './components/CartSidebar.js';
import { CartItem } from './components/CartItem.js';
import { CheckoutForm } from './components/CheckoutForm.js';
import { CategoryNav } from './components/CategoryNav.js';
import { SearchBar } from './components/SearchBar.js';
import { FilterPanel } from './components/FilterPanel.js';
import { Toast } from './components/Toast.js';

class ECommerceApp {
    constructor() {
        this.stateManager = new StateManager();
        this.eventBus = new EventBus();
        
        this.initializeModules();
        this.initializeComponents();
        this.setupEventListeners();
        this.loadInitialData();
        this.renderUI();
    }

    initializeModules() {
        this.productManager = new ProductManager(this.stateManager, this.eventBus);
        this.cartManager = new CartManager(this.stateManager, this.eventBus);
        this.checkoutManager = new CheckoutManager(this.stateManager, this.eventBus);
        this.categoryManager = new CategoryManager(this.stateManager, this.eventBus);
        this.searchManager = new SearchManager(this.stateManager, this.eventBus);
        this.filterManager = new FilterManager(this.stateManager, this.eventBus);
        this.userManager = new UserManager(this.stateManager, this.eventBus);
    }

    initializeComponents() {
        this.productCard = new ProductCard(this.stateManager, this.eventBus);
        this.productGrid = new ProductGrid(this.stateManager, this.eventBus);
        this.cartSidebar = new CartSidebar(this.stateManager, this.eventBus);
        this.cartItem = new CartItem(this.stateManager, this.eventBus);
        this.checkoutForm = new CheckoutForm(this.stateManager, this.eventBus);
        this.categoryNav = new CategoryNav(this.stateManager, this.eventBus);
        this.searchBar = new SearchBar(this.stateManager, this.eventBus);
        this.filterPanel = new FilterPanel(this.stateManager, this.eventBus);
        this.toast = new Toast(this.stateManager, this.eventBus);
    }

    setupEventListeners() {
        // Cart button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                this.cartManager.toggleCart();
            });
        }

        // Theme toggle - FIXED
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = document.getElementById('searchInput').value;
                this.searchManager.search(query);
            });
        }

        // Search input (debounced)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchManager.search(e.target.value);
                }, 300);
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filterManager.setSortBy(e.target.value);
            });
        }

        // View mode toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.setViewMode(view);
            });
        });

        // Load more button
        const loadMoreBtn = document.querySelector('.load-more button');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.productManager.loadMore();
            });
        }

        // Close modals on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.toast.show('You are back online!', 'success');
        });

        window.addEventListener('offline', () => {
            this.toast.show('You are offline. Shopping cart is still available.', 'warning');
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.stateManager.saveToStorage();
        });

        // Event bus listeners
        this.eventBus.on('cart:updated', () => {
            this.updateCartUI();
        });

        this.eventBus.on('products:filtered', () => {
            this.renderProducts();
        });

        this.eventBus.on('category:changed', (category) => {
            this.updateCategoryUI(category);
        });

        this.eventBus.on('search:results', () => {
            this.renderProducts();
        });

        this.eventBus.on('notification', ({ message, type }) => {
            this.toast.show(message, type);
        });
    }

    loadInitialData() {
        this.loadTheme();
        this.renderProducts();
        this.renderCategories();
        this.renderFilters();
        this.updateCartUI();
    }

    renderUI() {
        this.renderProducts();
        this.renderCategories();
        this.renderFilters();
        this.renderCartSidebar();
    }

    renderCartSidebar() {
        // Check if cart sidebar exists, if not create it
        let cartSidebar = document.getElementById('cartSidebar');
        if (!cartSidebar) {
            cartSidebar = document.createElement('div');
            cartSidebar.id = 'cartSidebar';
            cartSidebar.className = 'cart-sidebar';
            document.body.appendChild(cartSidebar);
        }
        
        cartSidebar.innerHTML = this.cartSidebar.render();
        
        // Re-attach close event
        const closeBtn = cartSidebar.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.cartManager.closeCart();
            });
        }
    }

    renderProducts() {
        const container = document.getElementById('productsGrid');
        if (!container) return;
        
        const { products, total, hasMore } = this.stateManager.getPaginatedProducts();
        
        container.innerHTML = this.productGrid.render(products);
        
        // Show/hide load more button
        const loadMoreContainer = document.querySelector('.load-more');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMore ? 'block' : 'none';
        }

        // Update section title
        const filters = this.stateManager.get('filters');
        const search = this.stateManager.get('search');
        const title = document.getElementById('sectionTitle');
        
        if (title) {
            if (search.query) {
                title.textContent = `Search results for "${search.query}"`;
            } else if (filters.category && filters.category !== 'all') {
                const category = this.stateManager.get('categories').find(c => c.id === filters.category);
                title.textContent = category ? category.name : 'All Products';
            } else {
                title.textContent = 'All Products';
            }
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesNav');
        if (!container) return;
        
        const categories = this.stateManager.get('categories');
        const currentCategory = this.stateManager.get('filters.category');
        
        container.innerHTML = this.categoryNav.render(categories, currentCategory);
    }

    renderFilters() {
        const container = document.getElementById('filterSidebar');
        if (!container) return;
        
        container.innerHTML = this.filterPanel.render();
        
        // Add filter event listeners
        this.filterPanel.attachEvents();
    }

    updateCartUI() {
        const count = this.stateManager.getCartCount();
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
        }
        
        // Update cart sidebar if open
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && this.stateManager.get('ui.cartOpen')) {
            cartSidebar.innerHTML = this.cartSidebar.render();
            
            // Re-attach close event
            const closeBtn = cartSidebar.querySelector('.close-cart');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.cartManager.closeCart();
                });
            }
        }
    }

    updateCategoryUI(category) {
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === category);
        });
    }

    setViewMode(mode) {
        this.stateManager.set('ui.viewMode', mode);
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.classList.toggle('list-view', mode === 'list');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.toast.show(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ECommerceApp();
});

// Global helper functions
window.addToCart = (productId) => {
    if (window.app) {
        app.cartManager.addToCart(productId);
    }
};

window.viewProduct = (productId) => {
    if (window.app) {
        app.productManager.viewProduct(productId);
    }
};

window.closeModal = () => {
    if (window.app) {
        app.closeAllModals();
    }
};