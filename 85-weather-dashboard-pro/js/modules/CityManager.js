class CityManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.citySelector = new CitySelector(stateManager, eventBus);
    }
}
window.CityManager = CityManager;