export class GameState {
    constructor() {
        this.moves = 0;
        this.pairsMatched = 0;
        this.totalPairs = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;
        this.listeners = new Map();
    }

    // Initialize game state
    initialize(totalPairs) {
        this.totalPairs = totalPairs;
        this.moves = 0;
        this.pairsMatched = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;
        this.endTime = null;
        this.notifyListeners();
    }

    // Start game timer
    startGame() {
        if (!this.gameStarted && !this.gameCompleted) {
            this.gameStarted = true;
            this.startTime = new Date();
            this.startTimer();
            this.notifyListeners();
        }
    }

    // Start timer interval
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (this.gameStarted && !this.gameCompleted) {
                this.notifyListeners('timer');
            }
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Increment moves
    incrementMoves() {
        if (!this.gameCompleted && this.gameStarted) {
            this.moves++;
            this.notifyListeners('moves');
        }
    }

    // Increment pairs matched
    incrementPairsMatched() {
        if (!this.gameCompleted) {
            this.pairsMatched++;
            this.notifyListeners('pairs');
            
            if (this.pairsMatched === this.totalPairs) {
                this.completeGame();
            }
        }
    }

    // Complete game
    completeGame() {
        this.gameCompleted = true;
        this.gameStarted = false;
        this.endTime = new Date();
        this.stopTimer();
        this.notifyListeners('complete');
    }

    // Get current time in seconds
    getCurrentTime() {
        if (!this.startTime) return 0;
        
        const end = this.endTime || new Date();
        return Math.floor((end - this.startTime) / 1000);
    }

    // Format time for display
    getFormattedTime() {
        const totalSeconds = this.getCurrentTime();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Add event listener
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    // Remove event listener
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Notify listeners
    notifyListeners(event = 'all') {
        if (event === 'all') {
            ['moves', 'pairs', 'timer', 'complete'].forEach(e => {
                if (this.listeners.has(e)) {
                    this.listeners.get(e).forEach(callback => callback(this));
                }
            });
        } else {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(callback => callback(this));
            }
        }
    }

    // Reset state
    reset() {
        this.stopTimer();
        this.initialize(this.totalPairs);
    }
}