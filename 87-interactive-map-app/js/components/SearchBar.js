class SearchBar {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        document.getElementById('searchBtn').onclick = () => this.search();
        document.getElementById('searchInput').onkeypress = (e) => { if(e.key === 'Enter') this.search(); };
    }

    async search() {
        const query = document.getElementById('searchInput').value;
        if(!query) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if(data && data[0]) { this.eventBus.emit('map:flyTo', [parseFloat(data[0].lat), parseFloat(data[0].lon)], 14); this.eventBus.emit('toast', { message: `Found: ${data[0].display_name}`, type: 'success' }); }
            else this.eventBus.emit('toast', { message: 'Location not found', type: 'error' });
        } catch(err) { this.eventBus.emit('toast', { message: 'Search failed', type: 'error' }); }
    }
}
window.SearchBar = SearchBar;