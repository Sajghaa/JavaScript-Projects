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
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameEngine.setSpeed(speed);
                this.eventBus.emit('toast', { message: `Difficulty changed!`, type: 'success' });
            };
        });
    }
}
window.SettingsPanel = SettingsPanel;