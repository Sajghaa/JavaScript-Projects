class ScoreModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.points = { 1: 100, 2: 300, 3: 500, 4: 800 };
        this.init();
    }

    init() {
        this.eventBus.on('lines:cleared', (lines) => this.addScore(lines));
        this.eventBus.on('game:over', () => this.endGame());
    }

    addScore(lines) {
        let score = this.stateManager.get('score');
        let totalLines = this.stateManager.get('lines');
        const points = this.points[lines] || 0;
        
        score += points;
        totalLines += lines;
        
        this.stateManager.set('score', score);
        this.stateManager.set('lines', totalLines);
        
        // Update level every 10 lines
        const level = Math.floor(totalLines / 10);
        this.stateManager.set('level', level);
        
        this.eventBus.emit('score:updated', score);
        this.eventBus.emit('lines:updated', totalLines);
        
        // Increase game speed based on level
        const baseSpeed = 500;
        const newSpeed = Math.max(100, baseSpeed - (level * 30));
        this.eventBus.emit('speed:change', newSpeed);
    }

    endGame() {
        this.stateManager.saveHighScore();
        this.eventBus.emit('stats:updated');
    }
}
window.ScoreModule = ScoreModule;