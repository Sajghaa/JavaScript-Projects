export class ProductGrid {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(products) {
        if (!products || products.length === 0) {
            return this.renderEmpty();
        }

        return products.map(product => {
            const card = new ProductCard(this.stateManager, this.eventBus);
            return card.render(product);
        }).join('');
    }

    renderEmpty() {
        return `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn btn-primary" onclick="app.filterManager.resetFilters()">
                    Clear Filters
                </button>
            </div>
        `;
    }

    renderSkeleton() {
        return Array(8).fill(0).map(() => `
            <div class="product-card skeleton">
                <div class="skeleton-image"></div>
                <div class="product-info">
                    <div class="skeleton-line" style="width: 80%"></div>
                    <div class="skeleton-line" style="width: 60%"></div>
                    <div class="skeleton-line" style="width: 40%"></div>
                </div>
            </div>
        `).join('');
    }
}