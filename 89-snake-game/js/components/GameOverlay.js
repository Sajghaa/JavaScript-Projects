class GameOverlay {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('game:over', () => this.showGameOver());
        this.eventBus.on('game:paused', () => this.showPause());
        this.eventBus.on('game:resumed', () => this.hidePause());
        this.eventBus.on('game:reset', () => this.hideAll());
        
        document.getElementById('restartBtn').onclick = () => this.eventBus.emit('game:restart');
        document.getElementById('resumeBtn').onclick = () => this.eventBus.emit('game:togglePause');
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.stateManager.get('score');
        document.getElementById('finalHighScore').textContent = this.stateManager.get('highScore');
        document.getElementById('gameOverlay').style.display = 'flex';
    }

    showPause() { document.getElementById('pauseOverlay').style.display = 'flex'; }
    hidePause() { document.getElementById('pauseOverlay').style.display = 'none'; }
    hideAll() { document.getElementById('gameOverlay').style.display = 'none'; document.getElementById('pauseOverlay').style.display = 'none'; }
}
window.GameOverlay = GameOverlay;