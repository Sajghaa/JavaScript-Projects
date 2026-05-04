class FileFilters {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        document.getElementById('searchInput').oninput = (e) => { this.stateManager.set('filters.search', e.target.value); this.eventBus.emit('files:updated'); };
        document.getElementById('typeFilter').onchange = (e) => { this.stateManager.set('filters.type', e.target.value); this.eventBus.emit('files:updated'); };
        document.getElementById('sortBy').onchange = (e) => { this.stateManager.set('filters.sortBy', e.target.value); this.eventBus.emit('files:updated'); };
        document.getElementById('clearFiltersBtn').onclick = () => { this.stateManager.set('filters', { search: '', type: 'all', sortBy: 'date' }); document.getElementById('searchInput').value = ''; document.getElementById('typeFilter').value = 'all'; document.getElementById('sortBy').value = 'date'; this.eventBus.emit('files:updated'); };
    }
}
window.FileFilters = FileFilters;