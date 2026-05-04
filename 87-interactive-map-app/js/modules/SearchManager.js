class SearchManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        new SearchBar(stateManager, eventBus);
    }
}
window.SearchManager = SearchManager;