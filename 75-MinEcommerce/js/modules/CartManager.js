export class CartManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    addToCart(productId, quantity = 1, options = {}) {
        const product = this.stateManager.getProduct(productId);
        
        if (!product) {
            this.eventBus.emit('notification', {
                message: 'Product not found',
                type: 'error'
            });
            return false;
        }

        if (!product.inStock) {
            this.eventBus.emit('notification', {
                message: 'Product is out of stock',
                type: 'error'
            });
            return false;
        }

        const success = this.stateManager.addToCart(productId, quantity, options);
        
        if (success) {
            this.eventBus.emit('notification', {
                message: `${product.name} added to cart`,
                type: 'success'
            });
            
            this.updateCartDisplay();
            this.openCart();
        }

        return success;
    }

    removeFromCart(productId, options = {}) {
        const product = this.stateManager.getProduct(productId);
        this.stateManager.removeFromCart(productId, options);
        
        this.eventBus.emit('notification', {
            message: `${product?.name || 'Item'} removed from cart`,
            type: 'info'
        });
        
        this.updateCartDisplay();
    }

    updateQuantity(productId, quantity, options = {}) {
        if (quantity <= 0) {
            this.removeFromCart(productId, options);
        } else {
            const success = this.stateManager.updateCartItem(productId, quantity, options);
            if (success) {
                this.updateCartDisplay();
            }
        }
    }

    increaseQuantity(productId, options = {}) {
        const item = this.stateManager.get('cart').find(item => 
            item.id === productId && JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (item) {
            const product = this.stateManager.getProduct(productId);
            if (item.quantity < product.stockCount) {
                this.updateQuantity(productId, item.quantity + 1, options);
            } else {
                this.eventBus.emit('notification', {
                    message: 'Maximum stock reached',
                    type: 'warning'
                });
            }
        }
    }

    decreaseQuantity(productId, options = {}) {
        const item = this.stateManager.get('cart').find(item => 
            item.id === productId && JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (item) {
            this.updateQuantity(productId, item.quantity - 1, options);
        }
    }

    clearCart() {
        if (this.stateManager.get('cart').length === 0) return;
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.stateManager.clearCart();
            
            this.eventBus.emit('notification', {
                message: 'Cart cleared',
                type: 'info'
            });
            
            this.updateCartDisplay();
        }
    }

    toggleCart() {
        const isOpen = this.stateManager.get('ui.cartOpen');
        this.stateManager.set('ui.cartOpen', !isOpen);
        
        // Update cart sidebar visibility
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            if (!isOpen) {
                cartSidebar.classList.add('open');
            } else {
                cartSidebar.classList.remove('open');
            }
        }
    }

    openCart() {
        this.stateManager.set('ui.cartOpen', true);
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
        }
    }

    closeCart() {
        this.stateManager.set('ui.cartOpen', false);
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }

    continueShopping() {
        this.closeCart();
    }

    updateCartDisplay() {
        this.eventBus.emit('cart:updated');
        
        // Update cart count in header
        const count = this.stateManager.getCartCount();
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = count;
        }
        
        // Update cart sidebar content
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar && this.stateManager.get('ui.cartOpen')) {
            const cartItems = cartSidebar.querySelector('.cart-items');
            const cartTotal = cartSidebar.querySelector('.cart-total span:last-child');
            
            if (cartItems) {
                const cart = this.stateManager.get('cart');
                if (cart.length === 0) {
                    cartItems.innerHTML = `
                        <div class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Your cart is empty</p>
                            <button class="btn btn-primary" onclick="app.cartManager.closeCart()">
                                Continue Shopping
                            </button>
                        </div>
                    `;
                } else {
                    const cartItemComponent = new CartItem(this.stateManager, this.eventBus);
                    cartItems.innerHTML = cart.map(item => cartItemComponent.render(item)).join('');
                }
            }
            
            if (cartTotal) {
                const total = this.stateManager.getCartTotal();
                cartTotal.textContent = `$${total.toFixed(2)}`;
            }
        }
    }

    getCartSummary() {
        const cart = this.stateManager.get('cart');
        const subtotal = this.stateManager.getCartTotal();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
            items: cart,
            itemCount,
            subtotal,
            shipping: subtotal >= 50 ? 0 : 5.99,
            tax: subtotal * 0.08,
            total: subtotal + (subtotal >= 50 ? 0 : 5.99) + (subtotal * 0.08)
        };
    }
}