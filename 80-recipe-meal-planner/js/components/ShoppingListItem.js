class ShoppingListItem {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }
}

window.ShoppingListItem = ShoppingListItem;