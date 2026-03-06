import { Card } from './Card.js';
import { cardSymbols, difficultyConfig } from '../data/cardData.js';
import { shuffleArray } from './utils.js';

export class GameBoard {
    constructor(container, gameState) {
        this.container = container;
        this.gameState = gameState;
        this.cards = [];
        this.selectedCards = [];
        this.canFlip = true;
        this.lockBoard = false;
        this.currentDifficulty = 'medium';
        
        this.initializeGame();
        this.setupEventListeners();
    }

    // Initialize game
    initializeGame() {
        const config = difficultyConfig[this.currentDifficulty];
        const symbols = this.getSymbolsForDifficulty(config.totalCards);
        this.createCards(symbols);
        this.render();
        this.gameState.initialize(config.totalCards / 2);
    }

    // Get symbols for difficulty
    getSymbolsForDifficulty(totalCards) {
        const neededPairs = totalCards / 2;
        const symbols = cardSymbols.animals;
        return symbols.slice(0, neededPairs);
    }

    // Create cards
    createCards(symbols) {
        const cardPairs = [];
        
        symbols.forEach((symbol, index) => {
            // Create two cards for each symbol (pair)
            cardPairs.push(new Card(`card-${index}-1`, symbol, `pair-${index}`));
            cardPairs.push(new Card(`card-${index}-2`, symbol, `pair-${index}`));
        });

        // Shuffle cards
        this.cards = shuffleArray(cardPairs);
    }

    // Render game board
    render() {
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${difficultyConfig[this.currentDifficulty].cols}, 1fr)`;
        
        this.cards.forEach(card => {
            const cardElement = card.createElement();
            cardElement.addEventListener('click', () => this.handleCardClick(card));
            this.container.appendChild(cardElement);
        });
    }

    // Handle card click
    async handleCardClick(card) {
        // Check if card can be flipped
        if (this.lockBoard || !card.isPlayable() || this.selectedCards.length >= 2) {
            return;
        }

        // Start game on first move
        if (!this.gameState.gameStarted && !this.gameState.gameCompleted) {
            this.gameState.startGame();
        }

        // Flip card
        if (card.flip()) {
            this.selectedCards.push(card);
            
            // Check for match if two cards are selected
            if (this.selectedCards.length === 2) {
                this.gameState.incrementMoves();
                await this.checkMatch();
            }
        }
    }

    // Check if selected cards match
    async checkMatch() {
        const [card1, card2] = this.selectedCards;
        
        // Lock board during check
        this.lockBoard = true;

        if (card1.pairId === card2.pairId) {
            // Match found
            setTimeout(() => {
                card1.match();
                card2.match();
                this.gameState.incrementPairsMatched();
                this.selectedCards = [];
                this.lockBoard = false;
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                card1.unflip();
                card2.unflip();
                this.selectedCards = [];
                this.lockBoard = false;
            }, 1000);
        }
    }

    // Shuffle remaining cards
    shuffle() {
        if (this.gameState.gameStarted && !this.gameState.gameCompleted) {
            // Don't shuffle during active game
            return;
        }

        // Reset all cards
        this.cards.forEach(card => card.reset());
        
        // Shuffle cards
        this.cards = shuffleArray(this.cards);
        
        // Re-render board
        this.render();
        
        // Reset selected cards
        this.selectedCards = [];
        this.lockBoard = false;
    }

    // Reset game
    reset() {
        this.cards.forEach(card => card.reset());
        this.cards = shuffleArray(this.cards);
        this.render();
        this.selectedCards = [];
        this.lockBoard = false;
        this.gameState.reset();
    }

    // Change difficulty
    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.initializeGame();
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for game completion
        this.gameState.addEventListener('complete', () => {
            this.showCompletionMessage();
        });
    }

    // Show completion message
    showCompletionMessage() {
        const message = document.getElementById('gameMessage');
        const time = this.gameState.getFormattedTime();
        message.innerHTML = `
            🎉 Congratulations! You won! 🎉<br>
            Moves: ${this.gameState.moves} | Time: ${time}
        `;
        message.style.color = 'var(--success)';
    }

    // Get board state
    getState() {
        return {
            cards: this.cards,
            selectedCards: this.selectedCards,
            lockBoard: this.lockBoard,
            difficulty: this.currentDifficulty
        };
    }
}