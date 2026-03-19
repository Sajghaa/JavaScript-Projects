export class CheckoutManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    showCheckout() {
        const cart = this.stateManager.get('cart');
        if (cart.length === 0) {
            this.eventBus.emit('notification', {
                message: 'Your cart is empty',
                type: 'warning'
            });
            return;
        }

        const modal = document.getElementById('checkoutModal');
        const body = document.getElementById('checkoutModalBody');
        
        const checkoutForm = new CheckoutForm(this.stateManager, this.eventBus);
        body.innerHTML = checkoutForm.render();

        modal.classList.add('active');
        this.closeCart();
    }

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
    }

    placeOrder() {
        const form = document.getElementById('checkoutForm');
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const orderData = {
            userId: this.stateManager.get('currentUser')?.id || 'guest',
            customer: {
                email: formData.get('email'),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName')
            },
            shipping: {
                address: formData.get('address'),
                apartment: formData.get('apartment'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode')
            },
            payment: {
                method: formData.get('payment'),
                // In real app, you would NOT include actual card details here
                lastFour: formData.get('cardNumber')?.slice(-4) || '0000'
            }
        };

        // Create order
        const order = this.stateManager.createOrder(orderData);

        // Show confirmation
        this.showOrderConfirmation(order);
        
        this.eventBus.emit('notification', {
            message: 'Order placed successfully!',
            type: 'success'
        });
    }

    showOrderConfirmation(order) {
        this.closeCheckout();
        
        const modal = document.getElementById('orderModal');
        const body = document.getElementById('orderModalBody');
        
        body.innerHTML = `
            <div class="order-confirmation">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                
                <h2>Thank You for Your Order!</h2>
                
                <div class="order-number">
                    Order #: ${order.id}
                </div>
                
                <p>A confirmation email has been sent to ${order.customer.email}</p>
                
                <div class="order-details">
                    <h3>Order Summary</h3>
                    
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    
                    <div class="order-total">
                        <strong>Total:</strong>
                        <strong>$${order.total.toFixed(2)}</strong>
                    </div>
                </div>
                
                <div class="shipping-info">
                    <h3>Shipping To:</h3>
                    <p>
                        ${order.customer.firstName} ${order.customer.lastName}<br>
                        ${order.shipping.address}<br>
                        ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}
                    </p>
                </div>
                
                <button class="btn btn-primary" onclick="app.checkoutManager.closeOrderModal()">
                    Continue Shopping
                </button>
            </div>
        `;

        modal.classList.add('active');
    }

    closeOrderModal() {
        document.getElementById('orderModal').classList.remove('active');
    }

    closeCart() {
        this.stateManager.set('ui.cartOpen', false);
    }
}