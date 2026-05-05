class ScoreBoard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('score:updated', (score) => this.updateScore(score));
        this.eventBus.on('stats:updated', () => this.updateStats());
        this.updateStats();
    }

    updateScore(score) {
        document.getElementById('currentScore').textContent = score;
        document.getElementById('highScore').textContent = this.stateManager.get('highScore');
    }

    updateStats() {
        document.getElementById('gamesPlayed').textContent = this.stateManager.get('gamesPlayed');
        document.getElementById('totalScore').textContent = this.stateManager.get('totalScore');
        document.getElementById('bestStreak').textContent = this.stateManager.get('bestStreak');
        document.getElementById('totalFood').textContent = this.stateManager.get('totalFood');
    }
}
window.ScoreBoard = ScoreBoard;