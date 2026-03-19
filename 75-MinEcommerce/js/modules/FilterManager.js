export class FilterManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    setCategory(category) {
        this.stateManager.setFilter('category', category);
        this.eventBus.emit('products:filtered');
    }

    setPriceRange() {
        const min = parseInt(document.getElementById('minPrice').value);
        const max = parseInt(document.getElementById('maxPrice').value);
        
        this.stateManager.setFilter('priceRange', { min, max });
        this.eventBus.emit('products:filtered');
    }

    updatePriceRange() {
        const minSlider = document.getElementById('minPriceSlider');
        const maxSlider = document.getElementById('maxPriceSlider');
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');
        
        minInput.value = minSlider.value;
        maxInput.value = maxSlider.value;
    }

    setRating(rating) {
        this.stateManager.setFilter('ratings', rating);
        this.eventBus.emit('products:filtered');
    }

    toggleInStock() {
        const inStock = document.getElementById('inStock').checked;
        this.stateManager.setFilter('inStock', inStock);
        this.eventBus.emit('products:filtered');
    }

    toggleBrand(brand) {
        // Implement brand filtering
        this.eventBus.emit('products:filtered');
    }

    setSortBy(sortBy) {
        this.stateManager.setFilter('sortBy', sortBy);
        this.eventBus.emit('products:filtered');
    }

    resetFilters() {
        this.stateManager.resetFilters();
        
        // Update UI
        document.querySelectorAll('.filter-option input[type="radio"]').forEach(input => {
            if (input.value === 'all') {
                input.checked = true;
            }
        });
        
        document.getElementById('inStock').checked = false;
        document.getElementById('minPrice').value = 0;
        document.getElementById('maxPrice').value = 1000;
        document.getElementById('minPriceSlider').value = 0;
        document.getElementById('maxPriceSlider').value = 1000;
        
        this.eventBus.emit('products:filtered');
        
        this.eventBus.emit('notification', {
            message: 'Filters reset',
            type: 'info'
        });
    }

    getActiveFilters() {
        const filters = this.stateManager.get('filters');
        const activeFilters = [];
        
        if (filters.category && filters.category !== 'all') {
            activeFilters.push({
                name: 'Category',
                value: filters.category,
                clear: () => this.setCategory('all')
            });
        }
        
        if (filters.ratings) {
            activeFilters.push({
                name: 'Rating',
                value: `${filters.ratings}+ Stars`,
                clear: () => this.setRating(null)
            });
        }
        
        if (filters.inStock) {
            activeFilters.push({
                name: 'In Stock Only',
                clear: () => this.toggleInStock()
            });
        }
        
        if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
            activeFilters.push({
                name: 'Price Range',
                value: `$${filters.priceRange.min} - $${filters.priceRange.max}`,
                clear: () => this.setPriceRange(0, 1000)
            });
        }
        
        return activeFilters;
    }
}