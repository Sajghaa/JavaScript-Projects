class InputModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        const key = e.key;
        switch(key) {
            case 'ArrowUp': this.eventBus.emit('snake:direction', 'UP'); break;
            case 'ArrowDown': this.eventBus.emit('snake:direction', 'DOWN'); break;
            case 'ArrowLeft': this.eventBus.emit('snake:direction', 'LEFT'); break;
            case 'ArrowRight': this.eventBus.emit('snake:direction', 'RIGHT'); break;
            case ' ': case 'Space': this.eventBus.emit('game:togglePause'); break;
            case 'r': case 'R': this.eventBus.emit('game:restart'); break;
        }
    }
}
window.InputModule = InputModule;