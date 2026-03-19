export class SearchBar {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render() {
        const query = this.stateManager.get('search.query');
        
        return `
            <div class="search-container">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" value="${query || ''}" 
                           placeholder="Search products..." autocomplete="off">
                    ${query ? `
                        <button class="clear-search" onclick="app.searchManager.clearSearch()">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                
                <div id="searchSuggestions" class="search-suggestions" style="display: none;"></div>
            </div>
        `;
    }

    renderSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) return '';

        return `
            <div class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" onclick="app.searchManager.selectSuggestion('${suggestion}')">
                        <i class="fas fa-search"></i>
                        <span>${this.highlightMatch(suggestion)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    highlightMatch(text) {
        const query = this.stateManager.get('search.query');
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}