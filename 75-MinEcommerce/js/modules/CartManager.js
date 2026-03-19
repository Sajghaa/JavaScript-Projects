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
    }

    openCart() {
        this.stateManager.set('ui.cartOpen', true);
    }

    closeCart() {
        this.stateManager.set('ui.cartOpen', false);
    }

    continueShopping() {
        this.closeCart();
    }

    updateCartDisplay() {
        this.eventBus.emit('cart:updated');
        
        // Update cart count in header
        const count = this.stateManager.getCartCount();
        document.getElementById('cartCount').textContent = count;
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