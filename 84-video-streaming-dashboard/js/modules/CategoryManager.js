class CategoryManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        new CategoryNav(stateManager, eventBus);
    }
}
window.CategoryManager = CategoryManager;