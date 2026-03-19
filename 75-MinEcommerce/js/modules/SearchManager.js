export class SearchManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    search(query) {
        query = query.trim().toLowerCase();
        
        this.stateManager.search(query);
        this.eventBus.emit('search:results', query);
        this.eventBus.emit('products:filtered');
        
        // Update URL
        const url = new URL(window.location);
        if (query) {
            url.searchParams.set('search', query);
        } else {
            url.searchParams.delete('search');
        }
        window.history.pushState({}, '', url);
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.search('');
    }

    getSuggestions(query) {
        if (!query) return [];
        
        const products = this.stateManager.get('products');
        const suggestions = new Set();
        
        query = query.toLowerCase();
        
        products.forEach(product => {
            if (product.name.toLowerCase().includes(query)) {
                suggestions.add(product.name);
            }
            if (product.brand.toLowerCase().includes(query)) {
                suggestions.add(product.brand);
            }
            product.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query)) {
                    suggestions.add(tag);
                }
            });
        });
        
        return Array.from(suggestions).slice(0, 5);
    }

    selectSuggestion(suggestion) {
        document.getElementById('searchInput').value = suggestion;
        this.search(suggestion);
        
        // Hide suggestions
        document.getElementById('searchSuggestions').style.display = 'none';
    }

    showSuggestions() {
        const input = document.getElementById('searchInput');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!input || !suggestionsContainer) return;
        
        input.addEventListener('input', () => {
            const query = input.value;
            if (query.length >= 2) {
                const suggestions = this.getSuggestions(query);
                if (suggestions.length > 0) {
                    const searchBar = new SearchBar(this.stateManager, this.eventBus);
                    suggestionsContainer.innerHTML = searchBar.renderSuggestions(suggestions);
                    suggestionsContainer.style.display = 'block';
                } else {
                    suggestionsContainer.style.display = 'none';
                }
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Hide suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }
}