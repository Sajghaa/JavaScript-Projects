class StateManager {
    constructor() {
        this.state = {
            board: Array(20).fill().map(() => Array(10).fill(0)),
            currentPiece: null,
            nextPiece: null,
            currentX: 3,
            currentY: 0,
            score: 0,
            lines: 0,
            highScore: 0,
            level: 0,
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
            localStorage.setItem('tetrisHighScore', this.state.highScore);
        }
    }

    loadHighScore() {
        this.state.highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
    }

    resetGame() {
        this.state.board = Array(20).fill().map(() => Array(10).fill(0));
        this.state.score = 0;
        this.state.lines = 0;
        this.state.level = 0;
        this.state.gameStatus = 'playing';
    }
}
window.StateManager = StateManager;