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
            case 'ArrowLeft': this.eventBus.emit('piece:moveLeft'); break;
            case 'ArrowRight': this.eventBus.emit('piece:moveRight'); break;
            case 'ArrowDown': this.eventBus.emit('piece:moveDown'); break;
            case 'ArrowUp': this.eventBus.emit('piece:rotate'); break;
            case ' ': case 'Space': this.eventBus.emit('piece:hardDrop'); break;
            case 'p': case 'P': this.eventBus.emit('game:togglePause'); break;
            case 'r': case 'R': this.eventBus.emit('game:restart'); break;
        }
    }
}
window.InputModule = InputModule;