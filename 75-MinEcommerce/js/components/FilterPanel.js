export class FilterPanel {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render() {
        const filters = this.stateManager.get('filters');
        const categories = this.stateManager.get('categories');
        const products = this.stateManager.get('products');
        
        const maxPrice = Math.max(...products.map(p => p.price));
        const minPrice = Math.min(...products.map(p => p.price));

        return `
            <div class="filter-panel">
                <div class="filter-header">
                    <h3>Filters</h3>
                    <button class="clear-filters" onclick="app.filterManager.resetFilters()">
                        Clear All
                    </button>
                </div>
                
                <div class="filter-section">
                    <h4>Category</h4>
                    <div class="filter-options">
                        <label class="filter-option">
                            <input type="radio" name="category" value="all" 
                                   ${filters.category === 'all' ? 'checked' : ''}
                                   onchange="app.filterManager.setCategory('all')">
                            <span>All Categories</span>
                        </label>
                        
                        ${categories.filter(c => c.id !== 'all').map(category => `
                            <label class="filter-option">
                                <input type="radio" name="category" value="${category.id}"
                                       ${filters.category === category.id ? 'checked' : ''}
                                       onchange="app.filterManager.setCategory('${category.id}')">
                                <span>${category.name}</span>
                                <span class="count">(${category.count})</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Price Range</h4>
                    <div class="price-range">
                        <input type="number" id="minPrice" value="${filters.priceRange.min}" 
                               min="${minPrice}" max="${maxPrice}" 
                               onchange="app.filterManager.setPriceRange()">
                        <span>to</span>
                        <input type="number" id="maxPrice" value="${filters.priceRange.max}" 
                               min="${minPrice}" max="${maxPrice}"
                               onchange="app.filterManager.setPriceRange()">
                    </div>
                    
                    <div class="price-slider">
                        <input type="range" id="minPriceSlider" min="${minPrice}" max="${maxPrice}" 
                               value="${filters.priceRange.min}" 
                               oninput="app.filterManager.updatePriceRange()">
                        <input type="range" id="maxPriceSlider" min="${minPrice}" max="${maxPrice}" 
                               value="${filters.priceRange.max}"
                               oninput="app.filterManager.updatePriceRange()">
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Customer Rating</h4>
                    <div class="filter-options">
                        ${[4, 3, 2, 1].map(rating => `
                            <label class="filter-option">
                                <input type="radio" name="rating" value="${rating}"
                                       ${filters.ratings === rating ? 'checked' : ''}
                                       onchange="app.filterManager.setRating(${rating})">
                                <span class="rating-stars">
                                    ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                                </span>
                                <span>& Up</span>
                            </label>
                        `).join('')}
                        <label class="filter-option">
                            <input type="radio" name="rating" value=""
                                   ${!filters.ratings ? 'checked' : ''}
                                   onchange="app.filterManager.setRating(null)">
                            <span>Any Rating</span>
                        </label>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Availability</h4>
                    <label class="filter-option">
                        <input type="checkbox" id="inStock" 
                               ${filters.inStock ? 'checked' : ''}
                               onchange="app.filterManager.toggleInStock()">
                        <span>In Stock Only</span>
                    </label>
                </div>
                
                <div class="filter-section">
                    <h4>Brands</h4>
                    ${this.renderBrandFilters()}
                </div>
            </div>
        `;
    }

    renderBrandFilters() {
        const products = this.stateManager.get('products');
        const brands = [...new Set(products.map(p => p.brand))];
        
        return brands.map(brand => `
            <label class="filter-option">
                <input type="checkbox" class="brand-filter" value="${brand}"
                       onchange="app.filterManager.toggleBrand('${brand}')">
                <span>${brand}</span>
            </label>
        `).join('');
    }

    attachEvents() {
        // Initialize dual range slider
        const minSlider = document.getElementById('minPriceSlider');
        const maxSlider = document.getElementById('maxPriceSlider');
        const minInput = document.getElementById('minPrice');
        const maxInput = document.getElementById('maxPrice');

        if (minSlider && maxSlider && minInput && maxInput) {
            minSlider.addEventListener('input', () => {
                if (parseInt(minSlider.value) > parseInt(maxSlider.value) - 10) {
                    minSlider.value = parseInt(maxSlider.value) - 10;
                }
                minInput.value = minSlider.value;
            });

            maxSlider.addEventListener('input', () => {
                if (parseInt(maxSlider.value) < parseInt(minSlider.value) + 10) {
                    maxSlider.value = parseInt(minSlider.value) + 10;
                }
                maxInput.value = maxSlider.value;
            });
        }
    }
}