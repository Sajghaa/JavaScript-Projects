// Memory Match Game - Production Ready
class MemoryGame {
    constructor() {
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.score = 0;
        this.time = 0;
        this.timerInterval = null;
        this.isGameActive = true;
        this.isProcessing = false;
        
        // Game settings
        this.difficulty = 'medium';
        this.theme = 'animals';
        this.soundEnabled = true;
        
        // Card themes data
        this.themes = {
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑'],
            space: ['🚀', '🛸', '🌍', '🌙', '⭐', '🌟', '🌞', '🪐', '🌌', '☄️', '🌠', '🛰️', '👨‍🚀', '👩‍🚀', '🔭', '🌡️', '⚡', '💫'],
            sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏂', '🏄', '🚴', '🏊', '🧗']
        };
        
        // Difficulty configurations
        this.difficulties = {
            easy: { rows: 4, cols: 3, pairs: 6, time: 120 },
            medium: { rows: 4, cols: 4, pairs: 8, time: 180 },
            hard: { rows: 6, cols: 4, pairs: 12, time: 240 },
            expert: { rows: 6, cols: 6, pairs: 18, time: 300 }
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.startNewGame();
    }
    
    loadSettings() {
        const savedDifficulty = localStorage.getItem('memory_difficulty');
        const savedTheme = localStorage.getItem('memory_theme');
        const savedSound = localStorage.getItem('memory_sound');
        
        if (savedDifficulty) this.difficulty = savedDifficulty;
        if (savedTheme) this.theme = savedTheme;
        if (savedSound) this.soundEnabled = savedSound === 'true';
        
        this.updateDifficultyButton();
        this.updateThemeButton();
        document.getElementById('soundToggle').checked = this.soundEnabled;
    }
    
    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('difficultyBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
    }
    
    startNewGame() {
        // Reset game state
        this.stopTimer();
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.score = 0;
        this.time = 0;
        this.isGameActive = true;
        this.isProcessing = false;
        
        // Update UI
        this.updateMoves();
        this.updateScore();
        this.updateTimerDisplay();
        
        // Generate cards
        this.generateCards();
        this.renderBoard();
        
        // Start timer
        this.startTimer();
    }
    
    generateCards() {
        const config = this.difficulties[this.difficulty];
        const totalPairs = config.pairs;
        const themeIcons = this.themes[this.theme];
        
        // Select icons for the game
        const selectedIcons = themeIcons.slice(0, totalPairs);
        
        // Create pairs
        let cards = [];
        selectedIcons.forEach((icon, index) => {
            cards.push({ id: index * 2, icon: icon, matched: false, flipped: false });
            cards.push({ id: index * 2 + 1, icon: icon, matched: false, flipped: false });
        });
        
        // Shuffle cards
        this.cards = this.shuffleArray(cards);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    renderBoard() {
        const board = document.getElementById('gameBoard');
        const config = this.difficulties[this.difficulty];
        
        board.className = `game-board ${this.difficulty}`;
        board.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            if (card.matched) cardElement.classList.add('matched');
            if (card.flipped) cardElement.classList.add('flipped');
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="card-front">${card.icon}</div>
                <div class="card-back"></div>
            `;
            
            cardElement.addEventListener('click', () => this.handleCardClick(index));
            board.appendChild(cardElement);
        });
    }
    
    handleCardClick(index) {
        // Validation checks
        if (!this.isGameActive) return;
        if (this.isProcessing) return;
        
        const card = this.cards[index];
        if (card.matched) return;
        if (card.flipped) return;
        if (this.flippedCards.length >= 2) return;
        
        // Play flip sound
        this.playSound('flip');
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(index);
        this.updateCardDisplay(index);
        
        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }
    
    updateCardDisplay(index) {
        const board = document.getElementById('gameBoard');
        const cardElement = board.children[index];
        if (this.cards[index].flipped) {
            cardElement.classList.add('flipped');
        } else {
            cardElement.classList.remove('flipped');
        }
    }
    
    checkMatch() {
        this.isProcessing = true;
        
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        // Increment moves
        this.moves++;
        this.updateMoves();
        
        if (card1.icon === card2.icon) {
            // Match found
            this.playSound('match');
            this.handleMatch(index1, index2);
        } else {
            // No match
            this.playSound('mismatch');
            this.handleMismatch(index1, index2);
        }
    }
    
    handleMatch(index1, index2) {
        this.cards[index1].matched = true;
        this.cards[index2].matched = true;
        this.cards[index1].flipped = true;
        this.cards[index2].flipped = true;
        
        this.matchedCards.push(index1, index2);
        
        // Update UI
        this.updateCardDisplay(index1);
        this.updateCardDisplay(index2);
        
        // Add match animation class
        const board = document.getElementById('gameBoard');
        board.children[index1].classList.add('matched');
        board.children[index2].classList.add('matched');
        
        // Calculate score (based on moves efficiency)
        const baseScore = 100;
        const movePenalty = Math.floor(this.moves / 10) * 5;
        const timeBonus = Math.max(0, 50 - Math.floor(this.time / 10));
        const pointsEarned = Math.max(10, baseScore - movePenalty + timeBonus);
        this.score += pointsEarned;
        this.updateScore();
        
        // Reset flipped cards
        this.flippedCards = [];
        this.isProcessing = false;
        
        // Check for victory
        if (this.matchedCards.length === this.cards.length) {
            this.victory();
        }
    }
    
    handleMismatch(index1, index2) {
        setTimeout(() => {
            this.cards[index1].flipped = false;
            this.cards[index2].flipped = false;
            this.updateCardDisplay(index1);
            this.updateCardDisplay(index2);
            
            this.flippedCards = [];
            this.isProcessing = false;
        }, 800);
    }
    
    updateMoves() {
        document.getElementById('moves').textContent = this.moves;
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.isGameActive && !this.isProcessing) {
                this.time++;
                this.updateTimerDisplay();
                
                // Check time limit
                const timeLimit = this.difficulties[this.difficulty].time;
                if (this.time >= timeLimit) {
                    this.gameOver();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Add warning class when time is low
        const timeLimit = this.difficulties[this.difficulty].time;
        const timeLeft = timeLimit - this.time;
        const timerElement = document.getElementById('timer').parentElement;
        
        if (timeLeft <= 10 && timeLeft > 0) {
            timerElement.style.background = '#ef4444';
        } else {
            timerElement.style.background = 'rgba(255,255,255,0.2)';
        }
    }
    
    victory() {
        this.isGameActive = false;
        this.stopTimer();
        this.playSound('victory');
        
        // Calculate rating
        const config = this.difficulties[this.difficulty];
        const timeLimit = config.time;
        const timeUsed = this.time;
        const timeScore = Math.max(0, 3 - Math.floor((timeUsed / timeLimit) * 3));
        const moveScore = Math.max(0, 3 - Math.floor(this.moves / 20));
        const rating = Math.min(3, Math.floor((timeScore + moveScore) / 2) + 1);
        
        // Show victory modal
        document.getElementById('victoryTime').textContent = document.getElementById('timer').textContent;
        document.getElementById('victoryMoves').textContent = this.moves;
        document.getElementById('victoryScore').textContent = this.score;
        
        const ratingContainer = document.getElementById('victoryRating');
        ratingContainer.innerHTML = '';
        for (let i = 0; i < rating; i++) {
            ratingContainer.innerHTML += '<i class="fas fa-star"></i>';
        }
        for (let i = rating; i < 3; i++) {
            ratingContainer.innerHTML += '<i class="far fa-star"></i>';
        }
        
        document.getElementById('victoryModal').classList.add('active');
    }
    
    gameOver() {
        this.isGameActive = false;
        this.stopTimer();
        this.playSound('gameover');
        
        // Show game over modal
        document.getElementById('gameoverMatches').textContent = Math.floor(this.matchedCards.length / 2);
        document.getElementById('gameoverMoves').textContent = this.moves;
        document.getElementById('gameOverModal').classList.add('active');
    }
    
    openSettings() {
        // Update active states in settings modal
        document.querySelectorAll('.difficulty-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.difficulty === this.difficulty);
        });
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === this.theme);
        });
        
        document.getElementById('settingsModal').classList.add('active');
    }
    
    applySettings() {
        const selectedDifficulty = document.querySelector('.difficulty-option.active')?.dataset.difficulty;
        const selectedTheme = document.querySelector('.theme-option.active')?.dataset.theme;
        const soundEnabled = document.getElementById('soundToggle').checked;
        
        if (selectedDifficulty) this.difficulty = selectedDifficulty;
        if (selectedTheme) this.theme = selectedTheme;
        this.soundEnabled = soundEnabled;
        
        // Save to localStorage
        localStorage.setItem('memory_difficulty', this.difficulty);
        localStorage.setItem('memory_theme', this.theme);
        localStorage.setItem('memory_sound', this.soundEnabled);
        
        this.updateDifficultyButton();
        this.updateThemeButton();
        this.startNewGame();
    }
    
    updateDifficultyButton() {
        const btn = document.getElementById('difficultyBtn');
        const difficultyNames = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
        btn.innerHTML = `<i class="fas fa-chart-line"></i> ${difficultyNames[this.difficulty]}`;
    }
    
    updateThemeButton() {
        // Theme button update not needed for main UI
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Simple beep sounds using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency = 440;
        let duration = 0.2;
        
        switch(type) {
            case 'flip':
                frequency = 523.25;
                duration = 0.1;
                break;
            case 'match':
                frequency = 659.25;
                duration = 0.15;
                break;
            case 'mismatch':
                frequency = 329.63;
                duration = 0.3;
                break;
            case 'victory':
                frequency = 783.99;
                duration = 0.5;
                break;
            case 'gameover':
                frequency = 261.63;
                duration = 0.8;
                break;
        }
        
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.3;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    closeModalAndNewGame() {
        this.closeAllModals();
        this.startNewGame();
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Initialize game
const game = new MemoryGame();

// Global functions for modal buttons
function closeModalAndNewGame() {
    game.closeModalAndNewGame();
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function applySettingsAndClose() {
    game.applySettings();
    document.getElementById('settingsModal').classList.remove('active');
}

// Difficulty and theme option listeners
document.querySelectorAll('.difficulty-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});