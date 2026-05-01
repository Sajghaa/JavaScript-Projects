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

    search() {
        const query = document.getElementById('searchInput').value;
        this.stateManager.set('searchQuery', query);
        this.eventBus.emit('search:updated', query);
    }

    clear() {
        document.getElementById('searchInput').value = '';
        this.search();
    }
}
window.SearchBar = SearchBar;