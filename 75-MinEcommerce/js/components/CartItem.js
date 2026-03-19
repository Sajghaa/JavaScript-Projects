export class CartItem {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(item) {
        return `
            <div class="cart-item" data-product-id="${item.id}" data-options='${JSON.stringify(item.options)}'>
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    
                    ${this.renderOptions(item.options)}
                    
                    <div class="cart-item-price">
                        $${item.price.toFixed(2)}
                    </div>
                    
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="app.cartManager.decreaseQuantity('${item.id}', ${JSON.stringify(item.options)})"
                                    ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            
                            <span class="quantity-value">${item.quantity}</span>
                            
                            <button class="quantity-btn" onclick="app.cartManager.increaseQuantity('${item.id}', ${JSON.stringify(item.options)})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <button class="remove-item" onclick="app.cartManager.removeFromCart('${item.id}', ${JSON.stringify(item.options)})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderOptions(options) {
        if (!options || Object.keys(options).length === 0) return '';
        
        return `
            <div class="cart-item-options">
                ${Object.entries(options).map(([key, value]) => `
                    <span class="option-badge">${key}: ${value}</span>
                `).join('')}
            </div>
        `;
    }
}