class ScoreModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('food:eaten', () => this.addScore());
        this.eventBus.on('game:over', () => this.endGame());
    }

    addScore() {
        let score = this.stateManager.get('score');
        let streak = this.stateManager.get('currentStreak');
        let totalFood = this.stateManager.get('totalFood');
        
        score += 10;
        streak++;
        totalFood++;
        
        this.stateManager.set('score', score);
        this.stateManager.set('currentStreak', streak);
        this.stateManager.set('totalFood', totalFood);
        
        const bestStreak = this.stateManager.get('bestStreak');
        if(streak > bestStreak) this.stateManager.set('bestStreak', streak);
        
        this.eventBus.emit('score:updated', score);
    }

    endGame() {
        const score = this.stateManager.get('score');
        const highScore = this.stateManager.get('highScore');
        let gamesPlayed = this.stateManager.get('gamesPlayed');
        let totalScore = this.stateManager.get('totalScore');
        
        gamesPlayed++;
        totalScore += score;
        
        if(score > highScore) this.stateManager.set('highScore', score);
        this.stateManager.set('gamesPlayed', gamesPlayed);
        this.stateManager.set('totalScore', totalScore);
        this.stateManager.saveHighScore();
        
        this.eventBus.emit('stats:updated');
    }
}
window.ScoreModule = ScoreModule;