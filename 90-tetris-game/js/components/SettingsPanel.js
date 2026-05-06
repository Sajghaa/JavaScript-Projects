class SettingsPanel {
    constructor(stateManager, eventBus, gameEngine) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.gameEngine = gameEngine;
        this.init();
    }

    init() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.onclick = () => {
                const speed = parseInt(btn.dataset.speed);
               