export class CategoryManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    selectCategory(categoryId) {
        this.stateManager.setFilter('category', categoryId);
        this.eventBus.emit('category:changed', categoryId);
        this.eventBus.emit('products:filtered');
        
        // Update URL without page reload
        const url = new URL(window.location);
        if (categoryId && categoryId !== 'all') {
            url.searchParams.set('category', categoryId);
        } else {
            url.searchParams.delete('category');
        }
        window.history.pushState({}, '', url);
    }

    getCategoryStats() {
        const products = this.stateManager.get('products');
        const categories = this.stateManager.get('categories');
        
        return categories.map(category => ({
            ...category,
            count: products.filter(p => p.category === category.id).length
        }));
    }

    getSubCategories(categoryId) {
        const products = this.stateManager.get('products');
        const subCategories = [...new Set(
            products
                .filter(p => p.category === categoryId)
                .map(p => p.subCategory)
        )];
        
        return subCategories.map(sub => ({
            id: sub,
            name: sub.charAt(0).toUpperCase() + sub.slice(1),
            count: products.filter(p => p.subCategory === sub).length
        }));
    }

    selectSubCategory(subCategory) {
        // Implement subcategory filtering
        this.eventBus.emit('products:filtered');
    }
}