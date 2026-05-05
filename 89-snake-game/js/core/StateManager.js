class StateManager {
    constructor() {
        this.state = {
            snake: [[10,10], [9,10], [8,10]],
            direction: 'RIGHT',
            nextDirection: 'RIGHT',
            food: [15,15],
            score: 0,
            highScore: 0,
            gamesPlayed: 0,
            totalScore: 0,
            totalFood: 0,
            bestStreak: 0,
            currentStreak: 0,
            gridSize: 20,
            cellSize: 30,
            gameStatus: 'idle'
        };
        this.listeners = new Map();
        this.loadHighScore();
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    saveHighScore() {
        if(this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('snakeHighScore', this.state.highScore);
        }
        localStorage.setItem('snakeStats', JSON.stringify({
            gamesPlayed: this.state.gamesPlayed,
            totalScore: this.state.totalScore,
            totalFood: this.state.totalFood,
            bestStreak: this.state.bestStreak
        }));
    }

    loadHighScore() {
        this.state.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        const stats = localStorage.getItem('snakeStats');
        if(stats) {
            const data = JSON.parse(stats);
            this.state.gamesPlayed = data.gamesPlayed || 0;
            this.state.totalScore = data.totalScore || 0;
            this.state.totalFood = data.totalFood || 0;
            this.state.bestStreak = data.bestStreak || 0;
        }
    }

    resetGame() {
        this.state.snake = [[10,10], [9,10], [8,10]];
        this.state.direction = 'RIGHT';
        this.state.nextDirection = 'RIGHT';
        this.state.score = 0;
        this.state.currentStreak = 0;
        this.state.gameStatus = 'playing';
    }
}
window.StateManager = StateManager;