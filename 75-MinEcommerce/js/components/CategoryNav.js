export class CategoryNav {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(categories, currentCategory) {
        return categories.map(category => `
            <button class="category-chip ${category.id === currentCategory ? 'active' : ''}" 
                    data-category="${category.id}"
                    onclick="app.categoryManager.selectCategory('${category.id}')">
                ${category.name}
                <span class="category-count">(${category.count})</span>
            </button>
        `).join('');
    }
}