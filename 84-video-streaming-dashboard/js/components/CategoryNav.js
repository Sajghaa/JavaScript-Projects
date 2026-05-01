class CategoryNav {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.render();
    }

    render() {
        const container = document.getElementById('categoriesNav');
        const categories = this.stateManager.get('categories');
        const current = this.stateManager.get('currentCategory');
        container.innerHTML = categories.map(cat => `
            <button class="category-chip ${cat.id === current ? 'active' : ''}" data-category="${cat.id}">
                ${cat.icon} ${cat.name}
            </button>
        `).join('');
        container.querySelectorAll('.category-chip').forEach(btn => {
            btn.onclick = () => {
                const category = btn.dataset.category;
                this.stateManager.set('currentCategory', category);
                this.eventBus.emit('category:changed', category);
                this.render();
            };
        });
    }
}
window.CategoryNav = CategoryNav;