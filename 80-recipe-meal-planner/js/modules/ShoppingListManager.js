// ShoppingListManager.js - Manages shopping list
class ShoppingListManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.init();
    }

    init() {
        document.getElementById('shoppingListBtn').onclick = () => this.showPanel();
        document.getElementById('clearShoppingListBtn').onclick = () => this.clearList();
        document.getElementById('addCustomItemBtn').onclick = () => this.showAddItemModal();
    }

    showPanel() {
        const panel = document.getElementById('shoppingListPanel');
        panel.classList.add('open');
        this.renderShoppingList();
    }

    closePanel() {
        document.getElementById('shoppingListPanel').classList.remove('open');
    }

    renderShoppingList() {
        const container = document.getElementById('shoppingList');
        const items = this.stateManager.get('shoppingList');
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-basket"></i>
                    <h3>Shopping list is empty</h3>
                    <p>Add items from recipes or manually add custom items</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="shopping-item ${item.checked ? 'completed' : ''}" data-id="${item.id}">
                <input type="checkbox" class="shopping-item-checkbox" ${item.checked ? 'checked' : ''}>
                <span class="shopping-item-name">${item.name}</span>
                <span class="shopping-item-quantity">${item.quantity || ''}</span>
                <button class="remove-shopping-item" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        container.querySelectorAll('.shopping-item-checkbox').forEach(cb => {
            cb.onchange = () => {
                const id = cb.closest('.shopping-item').dataset.id;
                this.stateManager.toggleShoppingItem(id);
                this.renderShoppingList();
            };
        });
        
        container.querySelectorAll('.remove-shopping-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                this.stateManager.removeFromShoppingList(id);
                this.renderShoppingList();
                this.eventBus.emit('toast', { message: 'Item removed', type: 'info' });
            };
        });
    }

    addFromRecipe(recipe) {
        recipe.ingredients.forEach(ingredient => {
            this.stateManager.addToShoppingList({
                name: ingredient.name,
                quantity: ingredient.amount
            });
        });
        this.eventBus.emit('toast', { message: 'Ingredients added to shopping list', type: 'success' });
    }

    showAddItemModal() {
        const modal = document.getElementById('customItemModal');
        document.getElementById('customItemName').value = '';
        document.getElementById('customItemQuantity').value = '';
        modal.classList.add('active');
        
        document.getElementById('confirmAddItemBtn').onclick = () => {
            const name = document.getElementById('customItemName').value;
            const quantity = document.getElementById('customItemQuantity').value;
            
            if (name) {
                this.stateManager.addToShoppingList({ name, quantity });
                this.renderShoppingList();
                this.closeModal();
                this.eventBus.emit('toast', { message: 'Item added to shopping list', type: 'success' });
            }
        };
    }

    clearList() {
        if (confirm('Clear entire shopping list?')) {
            this.stateManager.clearShoppingList();
            this.renderShoppingList();
            this.eventBus.emit('toast', { message: 'Shopping list cleared', type: 'info' });
        }
    }

    closeModal() {
        document.getElementById('customItemModal').classList.remove('active');
    }
}

window.ShoppingListManager = ShoppingListManager;