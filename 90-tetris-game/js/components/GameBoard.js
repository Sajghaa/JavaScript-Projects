class GameBoard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }
}
window.GameBoard = GameBoard;