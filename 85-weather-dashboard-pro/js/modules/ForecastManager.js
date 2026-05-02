class ForecastManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }
}
window.ForecastManager = ForecastManager;