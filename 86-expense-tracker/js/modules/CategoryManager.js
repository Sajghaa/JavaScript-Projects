class CategoryManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.populateFilters();
        this.eventBus.on('expenses:refresh', () => this.populateFilters());
    }

    populateFilters() {
        const filter = document.getElementById('categoryFilter');
        const categories = this.stateManager.get('categories');
        filter.innerHTML = '<option value="all">All Categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}
window.CategoryManager = CategoryManager;