export class CartSidebar {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render() {
        const isOpen = this.stateManager.get('ui.cartOpen');
        const cart = this.stateManager.get('cart');
        const total = this.stateManager.getCartTotal();

        return `
            <div class="cart-sidebar ${isOpen ? 'open' : ''}" id="cartSidebar">
                <div class="cart-header">
                    <h3>Your Cart</h3>
                    <button class="close-cart" onclick="app.cartManager.closeCart()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="cart-items" id="cartItems">
                    ${this.renderItems(cart)}
                </div>
                
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Subtotal:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    
                    <div class="cart-shipping">
                        ${total >= 50 ? 
                            '<span class="free-shipping">✓ Free Shipping Eligible</span>' :
                            `<span>Add $${(50 - total).toFixed(2)} for Free Shipping</span>`
                        }
                    </div>
                    
                    <button id="checkoutBtn" class="btn btn-primary btn-block" 
                            onclick="app.checkoutManager.showCheckout()"
                            ${cart.length === 0 ? 'disabled' : ''}>
                        Proceed to Checkout
                    </button>
                    
                    <button class="btn btn-secondary btn-block" onclick="app.cartManager.continueShopping()">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
    }

    renderItems(cart) {
        if (cart.length === 0) {
            return `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p class="empty-subtitle">Add some products to get started</p>
                </div>
            `;
        }

        return cart.map(item => {
            const itemComponent = new CartItem(this.stateManager, this.eventBus);
            return itemComponent.render(item);
        }).join('');
    }
}