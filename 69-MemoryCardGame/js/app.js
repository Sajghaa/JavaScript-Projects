import { GameBoard } from './modules/GameBoard.js';
import { GameState } from './modules/GameState.js';
import { storage } from './modules/utils.js';

class MemoryGameApp {
    constructor() {
        this.gameState = new GameState();
        this.gameBoard = null;
        this.theme = storage.get('theme', 'light');
        
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        // Get DOM elements
        this.boardContainer = document.getElementById('gameBoard');
        this.movesElement = document.getElementById('moves');
        this.pairsElement = document.getElementById('pairs-matched');
        this.timerElement = document.getElementById('timer');
        this.messageElement = document.getElementById('gameMessage');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('newGame');
        this.shuffleBtn = document.getElementById('shuffle');
        this.themeBtn = document.getElementById('toggleTheme');

        // Initialize game board
        this.gameBoard = new GameBoard(this.boardContainer, this.gameState);
        
        // Set initial theme
        this.setTheme(this.theme);
        
        // Setup game state listeners
        this.setupGameStateListeners();
    }

    setupGameStateListeners() {
        // Update moves
        this.gameState.addEventListener('moves', () => {
            this.movesElement.textContent = this.gameState.moves;
        });

        // Update pairs matched
        this.gameState.addEventListener('pairs', () => {
            this.pairsElement.textContent = `${this.gameState.pairsMatched}/${this.gameState.totalPairs}`;
        });

        // Update timer
        this.gameState.addEventListener('timer', () => {
            this.timerElement.textContent = this.gameState.getFormattedTime();
        });

        // Handle game completion
        this.gameState.addEventListener('complete', () => {
            this.saveHighScore();
        });
    }

    setupEventListeners() {
        // New game button
        this.newGameBtn.addEventListener('click', () => {
            this.resetGame();
        });

        // Shuffle button
        this.shuffleBtn.addEventListener('click', () => {
            if (confirm('Shuffle the board? This will reset the current game.')) {
                this.gameBoard.shuffle();
                this.messageElement.textContent = '';
            }
        });

        // Difficulty change
        this.difficultySelect.addEventListener('change', (e) => {
            if (confirm('Change difficulty? This will start a new game.')) {
                this.gameBoard.setDifficulty(e.target.value);
                this.resetDisplay();
            }
        });

        // Theme toggle
        this.themeBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Window resize
        window.addEventListener('resize', () => {
            // Re-render board if needed
            if (this.gameBoard) {
                this.gameBoard.render();
            }
        });
    }

    resetGame() {
        this.gameBoard.reset();
        this.resetDisplay();
        this.messageElement.textContent = '';
    }

    resetDisplay() {
        this.movesElement.textContent = '0';
        this.pairsElement.textContent = `0/${this.gameState.totalPairs}`;
        this.timerElement.textContent = '00:00';
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeBtn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        storage.set('theme', theme);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(this.theme);
    }

    saveHighScore() {
        const difficulty = this.difficultySelect.value;
        const highScores = storage.get('highScores', {});
        
        if (!highScores[difficulty]) {
            highScores[difficulty] = [];
        }

        const currentScore = {
            moves: this.gameState.moves,
            time: this.gameState.getCurrentTime(),
            date: new Date().toISOString()
        };

        highScores[difficulty].push(currentScore);
        
        // Keep only top 10 scores (lowest moves)
        highScores[difficulty].sort((a, b) => {
            if (a.moves === b.moves) {
                return a.time - b.time;
            }
            return a.moves - b.moves;
        });
        
        highScores[difficulty] = highScores[difficulty].slice(0, 10);
        
        storage.set('highScores', highScores);
        
        this.showHighScores();
    }

    showHighScores() {
        const difficulty = this.difficultySelect.value;
        const highScores = storage.get('highScores', {});
        const scores = highScores[difficulty] || [];
        
        if (scores.length > 0) {
            let message = '🏆 High Scores 🏆\n\n';
            scores.slice(0, 5).forEach((score, index) => {
                const date = new Date(score.date).toLocaleDateString();
                message += `${index + 1}. ${score.moves} moves (${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')}) - ${date}\n`;
            });
            
            // Display in message area
            this.messageElement.innerHTML = message.replace(/\n/g, '<br>');
            this.messageElement.style.color = 'var(--primary-color)';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGameApp();
});