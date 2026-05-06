class ScoreBoard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('score:updated', (score) => this.updateScore(score));
        this.eventBus.on('lines:updated', (lines) => this.updateLines(lines));
        this.updateScore(this.stateManager.get('score'));
        this.updateLines(this.stateManager.get('lines'));
        document.getElementById('highScore').textContent = this.stateManager.get('highScore');
    }

    updateScore(score) {
        document.getElementById('currentScore').textContent = score;
        document.getElementById('highScore').textContent = this.stateManager.get('highScore');
    }

    updateLines(lines) {
        document.getElementById('linesCount').textContent = lines;
    }
}
window.ScoreBoard = ScoreBoard;