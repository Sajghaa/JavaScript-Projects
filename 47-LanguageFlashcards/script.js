// Language Flashcards Application
class LanguageFlashcards {
    constructor() {
        this.decks = JSON.parse(localStorage.getItem('flashcardDecks')) || [];
        this.currentDeckId = null;
        this.currentCardIndex = 0;
        this.selectedCards = new Set();
        this.studyStats = this.loadStudyStats();
        this.isFlipped = false;
        this.isShuffled = false;
        this.sessionStats = {
            correct: 0,
            incorrect: 0,
            startTime: null
        };
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.renderDecks();
        this.updateStats();
        this.setupChart();
        
        // Load first deck if available
        if (this.decks.length > 0 && !this.currentDeckId) {
            this.selectDeck(this.decks[0].id);
        }
        
        // Initialize language selectors
        this.setupLanguageSelectors();
    }

    initializeElements() {
        // Deck elements
        this.deckSelector = document.getElementById('deck-selector');
        this.deckDetails = document.getElementById('deck-details');
        this.currentDeckNameEl = document.getElementById('current-deck-name');
        this.deckCardCountEl = document.getElementById('deck-card-count');
        this.deckMasteredCountEl = document.getElementById('deck-mastered-count');
        this.deckProgressFill = document.getElementById('deck-progress-fill');
        this.deckProgressText = document.getElementById('deck-progress-text');

        // Stats elements
        this.totalDecksEl = document.getElementById('total-decks');
        this.totalCardsEl = document.getElementById('total-cards');
        this.masteredCardsEl = document.getElementById('mastered-cards');
        this.currentStreakEl = document.getElementById('current-streak');

        // Card creator elements
        this.cardForm = document.getElementById('card-form');
        this.cardFrontInput = document.getElementById('card-front');
        this.cardBackInput = document.getElementById('card-back');
        this.frontLanguageSelect = document.getElementById('front-language');
        this.backLanguageSelect = document.getElementById('back-language');
        this.cardCategorySelect = document.getElementById('card-category');
        this.cardDifficultySelect = document.getElementById('card-difficulty');
        this.cardExampleInput = document.getElementById('card-example');
        this.cardNotesInput = document.getElementById('card-notes');
        this.clearFormBtn = document.getElementById('clear-form');
        this.addAnotherBtn = document.getElementById('add-another');

        // Flashcard viewer elements
        this.flashcard = document.getElementById('flashcard');
        this.frontContent = document.getElementById('front-content');
        this.backContent = document.getElementById('back-content');
        this.frontLanguageBadge = document.getElementById('front-language-badge');
        this.backLanguageBadge = document.getElementById('back-language-badge');
        this.frontCategory = document.getElementById('front-category');
        this.exampleSentence = document.getElementById('example-sentence');
        this.cardNotesView = document.getElementById('card-notes-view');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        this.currentCardNumberEl = document.getElementById('current-card-number');
        this.totalCardsViewerEl = document.getElementById('total-cards-viewer');

        // Flashcard control elements
        this.prevCardBtn = document.getElementById('prev-card');
        this.nextCardBtn = document.getElementById('next-card');
        this.flipCardBtn = document.getElementById('flip-card');
        this.shuffleCardsBtn = document.getElementById('shuffle-cards');
        this.markMasteredBtn = document.getElementById('mark-mastered');
        this.resetProgressBtn = document.getElementById('reset-progress');

        // Session stats elements
        this.sessionCorrectEl = document.getElementById('session-correct');
        this.sessionIncorrectEl = document.getElementById('session-incorrect');

        // Cards list elements
        this.cardsTableBody = document.getElementById('cards-table-body');
        this.searchCardsInput = document.getElementById('search-cards');
        this.filterStatusSelect = document.getElementById('filter-status');
        this.selectAllCardsCheckbox = document.getElementById('select-all-cards');
        this.bulkMasteredBtn = document.getElementById('bulk-mastered');
        this.bulkDeleteBtn = document.getElementById('bulk-delete');

        // Study stats elements
        this.studyTimeEl = document.getElementById('study-time');
        this.cardsReviewedEl = document.getElementById('cards-reviewed');
        this.accuracyRateEl = document.getElementById('accuracy-rate');
        this.bestStreakEl = document.getElementById('best-streak');
        this.studyChart = null;

        // Import/export elements
        this.importFileInput = document.getElementById('import-file');
        this.exportCurrentBtn = document.getElementById('export-current');

        // Templates
        this.deckTemplate = document.getElementById('deck-template');
        this.cardRowTemplate = document.getElementById('card-row-template');

        // Buttons
        this.createDeckBtn = document.getElementById('create-deck');
        this.editDeckBtn = document.getElementById('edit-deck');
        this.deleteDeckBtn = document.getElementById('delete-deck');
        this.exportDeckBtn = document.getElementById('export-deck');
        this.backupAllBtn = document.getElementById('backup-all');
        this.restoreBackupBtn = document.getElementById('restore-backup');

        // Modals
        this.createDeckModal = document.getElementById('create-deck-modal');
        this.editDeckModal = document.getElementById('edit-deck-modal');
        this.cardPreviewModal = document.getElementById('card-preview-modal');
        this.confirmModal = document.getElementById('confirm-modal');
        this.importInstructionsModal = document.getElementById('import-instructions-modal');
    }

    setupEventListeners() {
        // Deck management
        this.createDeckBtn.addEventListener('click', () => this.openCreateDeckModal());
        this.editDeckBtn.addEventListener('click', () => this.openEditDeckModal());
        this.deleteDeckBtn.addEventListener('click', () => this.confirmDeleteDeck());
        this.exportDeckBtn.addEventListener('click', () => this.exportCurrentDeck());

        // Card management
        this.cardForm.addEventListener('submit', (e) => this.handleAddCard(e));
        this.clearFormBtn.addEventListener('click', () => this.clearCardForm());
        this.addAnotherBtn.addEventListener('click', () => this.addCardAndNew());
        this.markMasteredBtn.addEventListener('click', () => this.toggleMastered());
        this.resetProgressBtn.addEventListener('click', () => this.resetDeckProgress());

        // Flashcard navigation
        this.prevCardBtn.addEventListener('click', () => this.showPreviousCard());
        this.nextCardBtn.addEventListener('click', () => this.showNextCard());
        this.flipCardBtn.addEventListener('click', () => this.flipCard());
        this.shuffleCardsBtn.addEventListener('click', () => this.toggleShuffle());

        // Flashcard click to flip
        this.flashcard.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-action')) {
                this.flipCard();
            }
        });

        // Search and filter
        this.searchCardsInput.addEventListener('input', () => this.filterCards());
        this.filterStatusSelect.addEventListener('change', () => this.filterCards());

        // Bulk actions
        this.selectAllCardsCheckbox.addEventListener('change', (e) => this.toggleSelectAllCards(e.target.checked));
        this.bulkMasteredBtn.addEventListener('click', () => this.bulkMarkMastered());
        this.bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteCards());

        // Import/export
        this.importFileInput.addEventListener('change', (e) => this.handleImport(e));
        this.exportCurrentBtn.addEventListener('click', () => this.exportCurrentDeck());

        // Backup/restore
        this.backupAllBtn.addEventListener('click', () => this.backupAllData());
        this.restoreBackupBtn.addEventListener('click', () => this.restoreBackup());

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Confirmation modal
        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeAllModals());
        document.getElementById('confirm-ok').addEventListener('click', () => this.handleConfirm());

        // Language selector changes
        document.querySelectorAll('#front-language, #back-language').forEach(select => {
            select.addEventListener('change', (e) => this.handleLanguageChange(e));
        });

        // View toggles
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Auto-save on unload
        window.addEventListener('beforeunload', () => this.saveAllData());
    }

    setupLanguageSelectors() {
        // Add language change handlers
        document.getElementById('front-language').addEventListener('change', (e) => {
            this.toggleCustomLanguageInput('front', e.target.value);
        });
        
        document.getElementById('back-language').addEventListener('change', (e) => {
            this.toggleCustomLanguageInput('back', e.target.value);
        });
    }

    toggleCustomLanguageInput(side, value) {
        const customInput = document.getElementById(`custom-${side}-language`);
        customInput.style.display = value === 'custom' ? 'block' : 'none';
    }

    // Deck Management
    getCurrentDeck() {
        return this.decks.find(deck => deck.id === this.currentDeckId);
    }

    getDeckCards(deckId = null) {
        const deck = deckId ? this.decks.find(d => d.id === deckId) : this.getCurrentDeck();
        return deck ? deck.cards : [];
    }

    createDeck(deckData) {
        const deck = {
            id: Date.now().toString(),
            name: deckData.name,
            description: deckData.description || '',
            primaryLanguage: deckData.primaryLanguage,
            targetLanguage: deckData.targetLanguage,
            color: deckData.color,
            isPublic: deckData.isPublic || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            cards: [],
            stats: {
                totalCards: 0,
                masteredCards: 0,
                lastStudied: null,
                studyCount: 0
            }
        };

        this.decks.push(deck);
        this.saveDecks();
        this.renderDecks();
        this.updateStats();
        
        // Select the new deck
        this.selectDeck(deck.id);
        
        this.showNotification('Deck created successfully!', 'success');
    }

    updateDeck(deckId, deckData) {
        const deckIndex = this.decks.findIndex(deck => deck.id === deckId);
        if (deckIndex !== -1) {
            this.decks[deckIndex] = {
                ...this.decks[deckIndex],
                ...deckData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveDecks();
            this.renderDecks();
            
            if (this.currentDeckId === deckId) {
                this.updateDeckDetails();
            }
            
            this.showNotification('Deck updated successfully!', 'success');
        }
    }

    deleteDeck(deckId) {
        this.decks = this.decks.filter(deck => deck.id !== deckId);
        
        if (this.currentDeckId === deckId) {
            this.currentDeckId = null;
            this.currentCardIndex = 0;
            this.deckDetails.style.display = 'none';
            this.clearFlashcard();
        }
        
        this.saveDecks();
        this.renderDecks();
        this.updateStats();
        
        this.showNotification('Deck deleted successfully!', 'success');
    }

    selectDeck(deckId) {
        this.currentDeckId = deckId;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.isShuffled = false;
        this.selectedCards.clear();
        
        // Update UI
        this.updateDeckDetails();
        this.renderCards();
        this.renderCardsList();
        this.updateBulkActions();
        
        // Show first card
        this.showCard(0);
        
        // Update deck selector
        document.querySelectorAll('.deck-item').forEach(item => {
            item.classList.toggle('active', item.dataset.deckId === deckId);
        });
    }

    updateDeckDetails() {
        const deck = this.getCurrentDeck();
        if (!deck) {
            this.deckDetails.style.display = 'none';
            return;
        }
        
        this.deckDetails.style.display = 'block';
        this.currentDeckNameEl.textContent = deck.name;
        this.deckCardCountEl.textContent = deck.cards.length;
        
        const masteredCount = deck.cards.filter(card => card.mastered).length;
        this.deckMasteredCountEl.textContent = masteredCount;
        
        const progress = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;
        this.deckProgressFill.style.width = `${progress}%`;
        this.deckProgressText.textContent = `${progress}% mastered`;
    }

    renderDecks() {
        this.deckSelector.innerHTML = '';
        
        if (this.decks.length === 0) {
            this.deckSelector.innerHTML = `
                <div class="empty-deck">
                    <i class="fas fa-inbox"></i>
                    <p>No decks available. Create your first deck!</p>
                </div>
            `;
            return;
        }
        
        this.decks.forEach(deck => {
            const template = this.deckTemplate.content.cloneNode(true);
            const deckItem = template.querySelector('.deck-item');
            
            deckItem.dataset.deckId = deck.id;
            if (this.currentDeckId === deck.id) {
                deckItem.classList.add('active');
            }
            
            // Calculate progress
            const masteredCount = deck.cards.filter(card => card.mastered).length;
            const progress = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;
            
            // Set deck icon color
            const deckIcon = template.querySelector('.deck-icon');
            deckIcon.style.backgroundColor = deck.color;
            deckIcon.style.color = this.getContrastColor(deck.color);
            
            template.querySelector('.deck-name').textContent = deck.name;
            template.querySelector('.deck-card-count').textContent = `${deck.cards.length} cards`;
            template.querySelector('.deck-language').textContent = 
                `${this.getLanguageName(deck.primaryLanguage)} → ${this.getLanguageName(deck.targetLanguage)}`;
            
            template.querySelector('.progress-fill').style.width = `${progress}%`;
            template.querySelector('.progress-percent').textContent = `${progress}%`;
            
            deckItem.addEventListener('click', () => this.selectDeck(deck.id));
            
            this.deckSelector.appendChild(deckItem);
        });
    }

    // Card Management
    handleAddCard(e) {
        e.preventDefault();
        
        const deck = this.getCurrentDeck();
        if (!deck) {
            this.showNotification('Please select or create a deck first', 'error');
            return;
        }
        
        const front = this.cardFrontInput.value.trim();
        const back = this.cardBackInput.value.trim();
        
        if (!front || !back) {
            this.showNotification('Please fill in both front and back of the card', 'error');
            return;
        }
        
        const frontLanguage = this.frontLanguageSelect.value;
        const backLanguage = this.backLanguageSelect.value;
        const customFrontLanguage = document.getElementById('custom-front-language').value;
        const customBackLanguage = document.getElementById('custom-back-language').value;
        
        const card = {
            id: Date.now().toString(),
            front,
            back,
            frontLanguage: frontLanguage === 'custom' ? customFrontLanguage : frontLanguage,
            backLanguage: backLanguage === 'custom' ? customBackLanguage : backLanguage,
            category: this.cardCategorySelect.value,
            difficulty: this.cardDifficultySelect.value,
            example: this.cardExampleInput.value.trim(),
            notes: this.cardNotesInput.value.trim(),
            mastered: false,
            createdAt: new Date().toISOString(),
            lastReviewed: null,
            reviewCount: 0,
            correctCount: 0,
            incorrectCount: 0
        };
        
        deck.cards.push(card);
        deck.stats.totalCards = deck.cards.length;
        deck.updatedAt = new Date().toISOString();
        
        this.saveDecks();
        this.renderCards();
        this.renderCardsList();
        this.updateDeckDetails();
        this.updateStats();
        
        // Show the new card
        this.showCard(deck.cards.length - 1);
        
        this.showNotification('Card added successfully!', 'success');
        
        // Clear form if not in "Add & New" mode
        if (e.submitter !== this.addAnotherBtn) {
            this.clearCardForm();
        }
    }

    addCardAndNew() {
        this.handleAddCard({ preventDefault: () => {}, submitter: this.addAnotherBtn });
        this.cardFrontInput.focus();
    }

    clearCardForm() {
        this.cardForm.reset();
        this.cardFrontInput.focus();
        document.getElementById('custom-front-language').style.display = 'none';
        document.getElementById('custom-back-language').style.display = 'none';
    }

    updateCard(cardId, cardData) {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const cardIndex = deck.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            deck.cards[cardIndex] = {
                ...deck.cards[cardIndex],
                ...cardData,
                updatedAt: new Date().toISOString()
            };
            
            deck.updatedAt = new Date().toISOString();
            this.saveDecks();
            this.renderCards();
            this.renderCardsList();
            this.updateDeckDetails();
            
            // Update current card if it's the one being edited
            if (this.currentCardIndex === cardIndex) {
                this.showCard(this.currentCardIndex);
            }
            
            this.showNotification('Card updated successfully!', 'success');
        }
    }

    deleteCard(cardId) {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const cardIndex = deck.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            deck.cards.splice(cardIndex, 1);
            deck.stats.totalCards = deck.cards.length;
            deck.updatedAt = new Date().toISOString();
            
            this.saveDecks();
            this.renderCards();
            this.renderCardsList();
            this.updateDeckDetails();
            this.updateStats();
            
            // Adjust current card index if needed
            if (this.currentCardIndex >= deck.cards.length) {
                this.currentCardIndex = Math.max(0, deck.cards.length - 1);
            }
            
            this.showCard(this.currentCardIndex);
            
            this.showNotification('Card deleted successfully!', 'success');
        }
    }

    toggleMastered() {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) return;
        
        const card = deck.cards[this.currentCardIndex];
        card.mastered = !card.mastered;
        card.lastReviewed = new Date().toISOString();
        
        if (card.mastered) {
            card.correctCount++;
            this.sessionStats.correct++;
        } else {
            card.incorrectCount++;
            this.sessionStats.incorrect++;
        }
        
        card.reviewCount++;
        
        deck.updatedAt = new Date().toISOString();
        this.saveDecks();
        
        // Update session stats
        this.updateSessionStats();
        
        // Update deck details
        this.updateDeckDetails();
        this.updateStats();
        
        // Update current card display
        this.showCard(this.currentCardIndex);
        
        // Update study stats
        this.updateStudyStats(card.mastered);
        
        this.showNotification(
            card.mastered ? 'Card marked as mastered!' : 'Card marked for review',
            card.mastered ? 'success' : 'info'
        );
    }

    resetDeckProgress() {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        this.showConfirmModal(
            'Reset Deck Progress',
            'Are you sure you want to reset all progress for this deck? This will mark all cards as unmastered and clear review history.',
            () => {
                deck.cards.forEach(card => {
                    card.mastered = false;
                    card.lastReviewed = null;
                    card.reviewCount = 0;
                    card.correctCount = 0;
                    card.incorrectCount = 0;
                });
                
                deck.stats.masteredCards = 0;
                deck.updatedAt = new Date().toISOString();
                
                this.saveDecks();
                this.renderCards();
                this.renderCardsList();
                this.updateDeckDetails();
                this.updateStats();
                this.showCard(this.currentCardIndex);
                
                this.showNotification('Deck progress reset successfully!', 'success');
            }
        );
    }

    // Flashcard Navigation
    showCard(index) {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) {
            this.clearFlashcard();
            return;
        }
        
        // Ensure index is within bounds
        if (index < 0) index = deck.cards.length - 1;
        if (index >= deck.cards.length) index = 0;
        
        this.currentCardIndex = index;
        const card = deck.cards[index];
        
        // Update card display
        this.frontContent.textContent = card.front;
        this.backContent.textContent = card.back;
        this.frontLanguageBadge.textContent = this.getLanguageName(card.frontLanguage);
        this.backLanguageBadge.textContent = this.getLanguageName(card.backLanguage);
        this.frontCategory.textContent = card.category;
        
        // Set language-specific styling
        this.frontContent.className = `card-content language-${card.frontLanguage}`;
        this.backContent.className = `card-content language-${card.backLanguage}`;
        
        // Update examples and notes
        if (card.example) {
            this.exampleSentence.innerHTML = `<strong>Example:</strong> ${card.example}`;
            this.exampleSentence.style.display = 'block';
        } else {
            this.exampleSentence.style.display = 'none';
        }
        
        if (card.notes) {
            this.cardNotesView.innerHTML = `<strong>Notes:</strong> ${card.notes}`;
            this.cardNotesView.style.display = 'block';
        } else {
            this.cardNotesView.style.display = 'none';
        }
        
        // Update difficulty badge
        this.difficultyBadge.innerHTML = '';
        const difficultySpan = document.createElement('span');
        difficultySpan.className = `difficulty-${card.difficulty}`;
        difficultySpan.textContent = card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1);
        this.difficultyBadge.appendChild(difficultySpan);
        
        // Update card counter
        this.currentCardNumberEl.textContent = index + 1;
        this.totalCardsViewerEl.textContent = deck.cards.length;
        
        // Reset flip state
        this.isFlipped = false;
        this.flashcard.classList.remove('flipped');
        
        // Update mastered button text
        this.markMasteredBtn.innerHTML = card.mastered 
            ? '<i class="fas fa-star"></i> Mark for Review'
            : '<i class="fas fa-star"></i> Mark Mastered';
            
        this.markMasteredBtn.classList.toggle('btn-outline', !card.mastered);
        this.markMasteredBtn.classList.toggle('btn-primary', card.mastered);
    }

    showNextCard() {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) return;
        
        let nextIndex = this.currentCardIndex + 1;
        if (nextIndex >= deck.cards.length) nextIndex = 0;
        
        this.showCard(nextIndex);
    }

    showPreviousCard() {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) return;
        
        let prevIndex = this.currentCardIndex - 1;
        if (prevIndex < 0) prevIndex = deck.cards.length - 1;
        
        this.showCard(prevIndex);
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        this.flashcard.classList.toggle('flipped', this.isFlipped);
    }

    toggleShuffle() {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) return;
        
        this.isShuffled = !this.isShuffled;
        
        if (this.isShuffled) {
            // Create a shuffled copy of the cards
            const shuffledIndices = [...Array(deck.cards.length).keys()];
            for (let i = shuffledIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
            }
            
            // Store the shuffled order
            deck.shuffledIndices = shuffledIndices;
            
            // Show first card in shuffled order
            this.currentCardIndex = shuffledIndices[0];
            this.shuffleCardsBtn.innerHTML = '<i class="fas fa-sort"></i> Unshuffle';
            this.shuffleCardsBtn.classList.remove('btn-outline');
            this.shuffleCardsBtn.classList.add('btn-primary');
        } else {
            // Restore original order
            delete deck.shuffledIndices;
            this.currentCardIndex = 0;
            this.shuffleCardsBtn.innerHTML = '<i class="fas fa-random"></i> Shuffle';
            this.shuffleCardsBtn.classList.remove('btn-primary');
            this.shuffleCardsBtn.classList.add('btn-outline');
        }
        
        this.saveDecks();
        this.showCard(this.currentCardIndex);
    }

    clearFlashcard() {
        this.frontContent.innerHTML = '<p>Select a deck and start practicing!</p>';
        this.backContent.innerHTML = '<p>Translation will appear here</p>';
        this.currentCardNumberEl.textContent = '0';
        this.totalCardsViewerEl.textContent = '0';
        this.isFlipped = false;
        this.flashcard.classList.remove('flipped');
    }

    // Cards List Management
    renderCardsList(filteredCards = null) {
        const deck = this.getCurrentDeck();
        if (!deck) {
            this.cardsTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-cards">
                            <i class="fas fa-cards"></i>
                            <p>No deck selected. Select or create a deck to view cards.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const cards = filteredCards || deck.cards;
        
        if (cards.length === 0) {
            this.cardsTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">
                        <div class="empty-cards">
                            <i class="fas fa-cards"></i>
                            <p>No cards in this deck. Add your first card!</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.cardsTableBody.innerHTML = '';
        
        cards.forEach((card, index) => {
            const template = this.cardRowTemplate.content.cloneNode(true);
            const row = template.querySelector('.card-row');
            
            // Set data attributes
            row.dataset.cardId = card.id;
            row.dataset.index = index;
            
            // Set checkbox
            const checkbox = template.querySelector('.card-select');
            checkbox.checked = this.selectedCards.has(card.id);
            checkbox.addEventListener('change', (e) => {
                this.toggleCardSelection(card.id, e.target.checked);
            });
            
            // Set card content
            template.querySelector('.card-front-cell .card-text').textContent = card.front;
            template.querySelector('.card-front-cell .card-language-small').textContent = 
                this.getLanguageName(card.frontLanguage);
            template.querySelector('.card-back-cell .card-text').textContent = card.back;
            template.querySelector('.card-back-cell .card-language-small').textContent = 
                this.getLanguageName(card.backLanguage);
            
            // Set category
            template.querySelector('.card-category-badge').textContent = card.category;
            
            // Set difficulty
            const difficultyBadge = template.querySelector('.difficulty-badge');
            difficultyBadge.className = `difficulty-badge difficulty-${card.difficulty}`;
            difficultyBadge.textContent = card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1);
            
            // Set status
            const statusBadge = template.querySelector('.status-badge');
            statusBadge.className = `status-badge status-${card.mastered ? 'mastered' : 'unmastered'}`;
            statusBadge.textContent = card.mastered ? 'Mastered' : 'Learning';
            
            // Set action buttons
            const editBtn = template.querySelector('.btn-edit');
            const deleteBtn = template.querySelector('.btn-delete');
            const previewBtn = template.querySelector('.btn-preview');
            
            editBtn.addEventListener('click', () => this.editCard(card.id));
            deleteBtn.addEventListener('click', () => this.confirmDeleteCard(card.id));
            previewBtn.addEventListener('click', () => this.previewCard(card.id));
            
            this.cardsTableBody.appendChild(row);
        });
    }

    filterCards() {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const searchTerm = this.searchCardsInput.value.toLowerCase().trim();
        const filterStatus = this.filterStatusSelect.value;
        
        let filteredCards = deck.cards;
        
        // Apply search filter
        if (searchTerm) {
            filteredCards = filteredCards.filter(card => 
                card.front.toLowerCase().includes(searchTerm) || 
                card.back.toLowerCase().includes(searchTerm) ||
                card.example?.toLowerCase().includes(searchTerm) ||
                card.notes?.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (filterStatus !== 'all') {
            switch (filterStatus) {
                case 'unmastered':
                    filteredCards = filteredCards.filter(card => !card.mastered);
                    break;
                case 'mastered':
                    filteredCards = filteredCards.filter(card => card.mastered);
                    break;
                case 'difficult':
                    filteredCards = filteredCards.filter(card => 
                        card.difficulty === 'hard' || card.incorrectCount > card.correctCount
                    );
                    break;
            }
        }
        
        this.renderCardsList(filteredCards);
    }

    toggleCardSelection(cardId, checked) {
        if (checked) {
            this.selectedCards.add(cardId);
        } else {
            this.selectedCards.delete(cardId);
        }
        
        this.updateBulkActions();
    }

    toggleSelectAllCards(checked) {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const checkboxes = document.querySelectorAll('.card-select');
        
        if (checked) {
            deck.cards.forEach(card => this.selectedCards.add(card.id));
            checkboxes.forEach(cb => cb.checked = true);
        } else {
            this.selectedCards.clear();
            checkboxes.forEach(cb => cb.checked = false);
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const count = this.selectedCards.size;
        this.bulkMasteredBtn.disabled = count === 0;
        this.bulkDeleteBtn.disabled = count === 0;
        this.bulkMasteredBtn.innerHTML = `<i class="fas fa-star"></i> Mark as Mastered (${count})`;
        this.bulkDeleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete Selected (${count})`;
    }

    bulkMarkMastered() {
        if (this.selectedCards.size === 0) return;
        
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        this.selectedCards.forEach(cardId => {
            const card = deck.cards.find(c => c.id === cardId);
            if (card) {
                card.mastered = true;
                card.lastReviewed = new Date().toISOString();
                card.reviewCount++;
                card.correctCount++;
            }
        });
        
        deck.updatedAt = new Date().toISOString();
        this.saveDecks();
        
        // Update UI
        this.renderCardsList();
        this.updateDeckDetails();
        this.updateStats();
        this.updateSessionStats();
        
        // Clear selection
        this.selectedCards.clear();
        this.selectAllCardsCheckbox.checked = false;
        this.updateBulkActions();
        
        this.showNotification(`${this.selectedCards.size} cards marked as mastered!`, 'success');
    }

    bulkDeleteCards() {
        if (this.selectedCards.size === 0) return;
        
        this.showConfirmModal(
            'Delete Selected Cards',
            `Are you sure you want to delete ${this.selectedCards.size} card(s)? This action cannot be undone.`,
            () => {
                const deck = this.getCurrentDeck();
                if (!deck) return;
                
                deck.cards = deck.cards.filter(card => !this.selectedCards.has(card.id));
                deck.stats.totalCards = deck.cards.length;
                deck.updatedAt = new Date().toISOString();
                
                this.saveDecks();
                
                // Update UI
                this.renderCards();
                this.renderCardsList();
                this.updateDeckDetails();
                this.updateStats();
                
                // Adjust current card index if needed
                if (this.currentCardIndex >= deck.cards.length) {
                    this.currentCardIndex = Math.max(0, deck.cards.length - 1);
                }
                
                this.showCard(this.currentCardIndex);
                
                // Clear selection
                this.selectedCards.clear();
                this.selectAllCardsCheckbox.checked = false;
                this.updateBulkActions();
                
                this.showNotification(`${this.selectedCards.size} cards deleted successfully!`, 'success');
            }
        );
    }

    editCard(cardId) {
        // This would open an edit modal
        // For now, we'll just select the card
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const cardIndex = deck.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            this.showCard(cardIndex);
            this.showNotification('Card selected for editing', 'info');
        }
    }

    previewCard(cardId) {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const card = deck.cards.find(c => c.id === cardId);
        if (!card) return;
        
        // Populate preview modal
        document.getElementById('preview-front-content').textContent = card.front;
        document.getElementById('preview-back-content').textContent = card.back;
        document.getElementById('preview-front-language').textContent = this.getLanguageName(card.frontLanguage);
        document.getElementById('preview-back-language').textContent = this.getLanguageName(card.backLanguage);
        
        if (card.example) {
            document.getElementById('preview-example').innerHTML = `<strong>Example:</strong> ${card.example}`;
            document.getElementById('preview-example').style.display = 'block';
        } else {
            document.getElementById('preview-example').style.display = 'none';
        }
        
        if (card.notes) {
            document.getElementById('preview-notes').innerHTML = `<strong>Notes:</strong> ${card.notes}`;
            document.getElementById('preview-notes').style.display = 'block';
        } else {
            document.getElementById('preview-notes').style.display = 'none';
        }
        
        // Set up flip button
        document.getElementById('flip-preview').onclick = () => {
            document.querySelector('.card-preview').classList.toggle('flipped');
        };
        
        // Set up edit button
        document.getElementById('edit-from-preview').onclick = () => {
            this.closeAllModals();
            this.editCard(cardId);
        };
        
        // Open modal
        this.openModal('card-preview-modal');
    }

    // Import/Export
    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                let cards;
                
                if (file.name.endsWith('.json')) {
                    cards = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    cards = this.parseCSV(content);
                } else {
                    throw new Error('Unsupported file format');
                }
                
                if (!Array.isArray(cards)) {
                    throw new Error('Invalid file format: expected array of cards');
                }
                
                const deck = this.getCurrentDeck();
                if (!deck) {
                    this.showNotification('Please select a deck before importing', 'error');
                    return;
                }
                
                // Add imported cards
                cards.forEach(cardData => {
                    const card = {
                        id: Date.now().toString() + Math.random(),
                        front: cardData.front || '',
                        back: cardData.back || '',
                        frontLanguage: cardData.frontLanguage || 'en',
                        backLanguage: cardData.backLanguage || 'en',
                        category: cardData.category || 'vocabulary',
                        difficulty: cardData.difficulty || 'easy',
                        example: cardData.example || '',
                        notes: cardData.notes || '',
                        mastered: false,
                        createdAt: new Date().toISOString(),
                        lastReviewed: null,
                        reviewCount: 0,
                        correctCount: 0,
                        incorrectCount: 0
                    };
                    
                    deck.cards.push(card);
                });
                
                deck.stats.totalCards = deck.cards.length;
                deck.updatedAt = new Date().toISOString();
                
                this.saveDecks();
                this.renderCards();
                this.renderCardsList();
                this.updateDeckDetails();
                this.updateStats();
                
                // Clear file input
                e.target.value = '';
                
                this.showNotification(`${cards.length} cards imported successfully!`, 'success');
                
            } catch (error) {
                this.showNotification('Error importing cards: ' + error.message, 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    }

    parseCSV(content) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const cards = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const card = {};
            
            headers.forEach((header, index) => {
                if (values[index]) {
                    card[header] = values[index];
                }
            });
            
            cards.push(card);
        }
        
        return cards;
    }

    exportCurrentDeck() {
        const deck = this.getCurrentDeck();
        if (!deck || deck.cards.length === 0) {
            this.showNotification('No cards to export', 'error');
            return;
        }
        
        const exportData = {
            deck: {
                name: deck.name,
                description: deck.description,
                primaryLanguage: deck.primaryLanguage,
                targetLanguage: deck.targetLanguage,
                createdAt: deck.createdAt
            },
            cards: deck.cards.map(card => ({
                front: card.front,
                back: card.back,
                frontLanguage: card.frontLanguage,
                backLanguage: card.backLanguage,
                category: card.category,
                difficulty: card.difficulty,
                example: card.example,
                notes: card.notes
            })),
            exportDate: new Date().toISOString(),
            totalCards: deck.cards.length
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `flashcards-${deck.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        this.showNotification('Deck exported successfully!', 'success');
    }

    backupAllData() {
        const backupData = {
            decks: this.decks,
            studyStats: this.studyStats,
            backupDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `flashcards-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        this.showNotification('All data backed up successfully!', 'success');
    }

    restoreBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (!backup.decks || !Array.isArray(backup.decks)) {
                        throw new Error('Invalid backup file');
                    }
                    
                    this.showConfirmModal(
                        'Restore Backup',
                        `This will replace all current data with ${backup.decks.length} deck(s) from the backup. This action cannot be undone.`,
                        () => {
                            this.decks = backup.decks;
                            this.studyStats = backup.studyStats || this.loadStudyStats();
                            
                            this.saveDecks();
                            this.saveStudyStats();
                            
                            this.renderDecks();
                            this.updateStats();
                            this.updateChart();
                            
                            // Select first deck if available
                            if (this.decks.length > 0) {
                                this.selectDeck(this.decks[0].id);
                            } else {
                                this.currentDeckId = null;
                                this.currentCardIndex = 0;
                                this.clearFlashcard();
                            }
                            
                            this.showNotification('Backup restored successfully!', 'success');
                        }
                    );
                } catch (error) {
                    this.showNotification('Error restoring backup: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Study Statistics
    loadStudyStats() {
        const defaultStats = {
            totalStudyTime: 0, // in minutes
            totalCardsReviewed: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastStudyDate: null,
            dailyStats: {}
        };
        
        const savedStats = localStorage.getItem('flashcardStudyStats');
        return savedStats ? { ...defaultStats, ...JSON.parse(savedStats) } : defaultStats;
    }

    saveStudyStats() {
        localStorage.setItem('flashcardStudyStats', JSON.stringify(this.studyStats));
    }

    updateStudyStats(correct) {
        const today = new Date().toDateString();
        
        // Initialize today's stats if needed
        if (!this.studyStats.dailyStats[today]) {
            this.studyStats.dailyStats[today] = {
                studyTime: 0,
                cardsReviewed: 0,
                correct: 0,
                incorrect: 0
            };
        }
        
        // Update today's stats
        this.studyStats.dailyStats[today].cardsReviewed++;
        if (correct) {
            this.studyStats.dailyStats[today].correct++;
            this.studyStats.totalCorrect++;
        } else {
            this.studyStats.dailyStats[today].incorrect++;
            this.studyStats.totalIncorrect++;
        }
        
        // Update totals
        this.studyStats.totalCardsReviewed++;
        
        // Update streak
        if (this.studyStats.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (this.studyStats.lastStudyDate === yesterdayStr) {
                this.studyStats.currentStreak++;
            } else {
                this.studyStats.currentStreak = 1;
            }
            
            this.studyStats.lastStudyDate = today;
            
            // Update best streak
            if (this.studyStats.currentStreak > this.studyStats.bestStreak) {
                this.studyStats.bestStreak = this.studyStats.currentStreak;
            }
        }
        
        this.saveStudyStats();
        this.updateStudyStatsDisplay();
    }

    updateStudyStatsDisplay() {
        // Calculate study time (simplified - in real app, track actual time)
        const totalMinutes = this.studyStats.totalStudyTime;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        this.studyTimeEl.textContent = `${hours}h ${minutes}m`;
        
        this.cardsReviewedEl.textContent = this.studyStats.totalCardsReviewed;
        
        // Calculate accuracy rate
        const totalAttempts = this.studyStats.totalCorrect + this.studyStats.totalIncorrect;
        const accuracy = totalAttempts > 0 ? 
            Math.round((this.studyStats.totalCorrect / totalAttempts) * 100) : 0;
        this.accuracyRateEl.textContent = `${accuracy}%`;
        
        this.bestStreakEl.textContent = `${this.studyStats.bestStreak} days`;
        this.currentStreakEl.textContent = `${this.studyStats.currentStreak} days`;
    }

    updateSessionStats() {
        this.sessionCorrectEl.textContent = this.sessionStats.correct;
        this.sessionIncorrectEl.textContent = this.sessionStats.incorrect;
    }

    // Chart Setup
    setupChart() {
        const ctx = document.getElementById('study-chart').getContext('2d');
        
        // Get last 7 days of data
        const last7Days = this.getLast7DaysData();
        
        this.studyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days.labels,
                datasets: [{
                    label: 'Cards Reviewed',
                    data: last7Days.data,
                    backgroundColor: 'rgba(67, 97, 238, 0.5)',
                    borderColor: 'rgb(67, 97, 238)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Cards reviewed: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }

    getLast7DaysData() {
        const labels = [];
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dateString = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dateString);
            
            // Get study data for this day
            const dateKey = date.toDateString();
            const dayStats = this.studyStats.dailyStats[dateKey];
            data.push(dayStats ? dayStats.cardsReviewed : 0);
        }
        
        return { labels, data };
    }

    updateChart() {
        if (!this.studyChart) return;
        
        const last7Days = this.getLast7DaysData();
        this.studyChart.data.labels = last7Days.labels;
        this.studyChart.data.datasets[0].data = last7Days.data;
        this.studyChart.update();
    }

    // Modal Management
    openCreateDeckModal() {
        // Reset form
        document.getElementById('new-deck-name').value = '';
        document.getElementById('new-deck-description').value = '';
        document.getElementById('new-deck-language').value = 'en';
        document.getElementById('new-deck-target-language').value = 'es';
        document.getElementById('selected-deck-color').value = '#4361ee';
        
        // Reset color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === '#4361ee') {
                option.classList.add('selected');
            }
        });
        
        // Set up color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                document.getElementById('selected-deck-color').value = option.dataset.color;
            });
        });
        
        // Set up save button
        document.getElementById('save-deck').onclick = () => this.saveNewDeck();
        
        this.openModal('create-deck-modal');
    }

    saveNewDeck() {
        const name = document.getElementById('new-deck-name').value.trim();
        if (!name) {
            this.showNotification('Please enter a deck name', 'error');
            return;
        }
        
        const deckData = {
            name,
            description: document.getElementById('new-deck-description').value.trim(),
            primaryLanguage: document.getElementById('new-deck-language').value,
            targetLanguage: document.getElementById('new-deck-target-language').value,
            color: document.getElementById('selected-deck-color').value,
            isPublic: document.getElementById('new-deck-public').checked
        };
        
        this.createDeck(deckData);
        this.closeAllModals();
    }

    openEditDeckModal() {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        // Populate form
        document.getElementById('new-deck-name').value = deck.name;
        document.getElementById('new-deck-description').value = deck.description || '';
        document.getElementById('new-deck-language').value = deck.primaryLanguage;
        document.getElementById('new-deck-target-language').value = deck.targetLanguage;
        document.getElementById('selected-deck-color').value = deck.color;
        document.getElementById('new-deck-public').checked = deck.isPublic || false;
        
        // Set up color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === deck.color) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                document.getElementById('selected-deck-color').value = option.dataset.color;
            });
        });
        
        // Set up update button
        document.getElementById('save-deck').onclick = () => {
            this.updateCurrentDeck();
            this.closeAllModals();
        };
        
        // Change button text
        document.getElementById('save-deck').innerHTML = '<i class="fas fa-save"></i> Update Deck';
        
        this.openModal('create-deck-modal');
    }

    updateCurrentDeck() {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const deckData = {
            name: document.getElementById('new-deck-name').value.trim(),
            description: document.getElementById('new-deck-description').value.trim(),
            primaryLanguage: document.getElementById('new-deck-language').value,
            targetLanguage: document.getElementById('new-deck-target-language').value,
            color: document.getElementById('selected-deck-color').value,
            isPublic: document.getElementById('new-deck-public').checked
        };
        
        this.updateDeck(deck.id, deckData);
    }

    confirmDeleteDeck() {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        this.showConfirmModal(
            'Delete Deck',
            `Are you sure you want to delete the deck "${deck.name}"? This will delete all ${deck.cards.length} cards in the deck. This action cannot be undone.`,
            () => this.deleteDeck(deck.id)
        );
    }

    confirmDeleteCard(cardId) {
        const deck = this.getCurrentDeck();
        if (!deck) return;
        
        const card = deck.cards.find(c => c.id === cardId);
        if (!card) return;
        
        this.showConfirmModal(
            'Delete Card',
            `Are you sure you want to delete this card? Front: "${card.front}"`,
            () => this.deleteCard(cardId)
        );
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        
        const confirmBtn = document.getElementById('confirm-ok');
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeAllModals();
        };
        
        this.openModal('confirm-modal');
    }

    // View Management
    switchView(view) {
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Show/hide appropriate sections
        // This is a simplified version - in a real app, you'd have more complex view switching
        console.log('Switching to view:', view);
    }

    // Utility Methods
    updateStats() {
        let totalCards = 0;
        let masteredCards = 0;
        
        this.decks.forEach(deck => {
            totalCards += deck.cards.length;
            masteredCards += deck.cards.filter(card => card.mastered).length;
        });
        
        this.totalDecksEl.textContent = this.decks.length;
        this.totalCardsEl.textContent = totalCards;
        this.masteredCardsEl.textContent = masteredCards;
        this.totalCardsViewerEl.textContent = totalCards;
    }

    renderCards() {
        // This updates the card counter and enables/disables navigation buttons
        const deck = this.getCurrentDeck();
        const hasCards = deck && deck.cards.length > 0;
        
        this.prevCardBtn.disabled = !hasCards;
        this.nextCardBtn.disabled = !hasCards;
        this.flipCardBtn.disabled = !hasCards;
        this.shuffleCardsBtn.disabled = !hasCards;
        this.markMasteredBtn.disabled = !hasCards;
        this.resetProgressBtn.disabled = !hasCards;
    }

    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi'
        };
        
        return languages[code] || code;
    }

    getContrastColor(hexcolor) {
        // Remove # if present
        hexcolor = hexcolor.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white depending on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: var(--radius-md);
                    padding: var(--spacing-md) var(--spacing-lg);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--spacing-md);
                    z-index: 9999;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                .notification-success {
                    border-left: 4px solid #4cc9f0;
                }
                .notification-error {
                    border-left: 4px solid #f72585;
                }
                .notification-info {
                    border-left: 4px solid #4361ee;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }
                .notification-content i {
                    font-size: 1.25rem;
                }
                .notification-success .notification-content i { color: #4cc9f0; }
                .notification-error .notification-content i { color: #f72585; }
                .notification-info .notification-content i { color: #4361ee; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: var(--text-light);
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    saveDecks() {
        localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
    }

    saveAllData() {
        this.saveDecks();
        this.saveStudyStats();
    }

    handleConfirm() {
        // This is handled by the showConfirmModal function
        this.closeAllModals();
    }

    handleLanguageChange(e) {
        const select = e.target;
        const customInputId = `custom-${select.id.replace('-language', '')}-language`;
        const customInput = document.getElementById(customInputId);
        
        if (select.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardsApp = new LanguageFlashcards();
    
    // Add sample data button for testing
    const sampleDataBtn = document.createElement('button');
    sampleDataBtn.className = 'btn btn-outline';
    sampleDataBtn.style.position = 'fixed';
    sampleDataBtn.style.bottom = '20px';
    sampleDataBtn.style.right = '20px';
    sampleDataBtn.style.zIndex = '1000';
    sampleDataBtn.innerHTML = '<i class="fas fa-magic"></i> Add Sample Data';
    sampleDataBtn.addEventListener('click', () => addSampleData());
    document.body.appendChild(sampleDataBtn);
    
    function addSampleData() {
        const app = window.flashcardsApp;
        
        // Create sample deck if none exist
        if (app.decks.length === 0) {
            const sampleDeck = {
                id: 'sample-deck-1',
                name: 'Spanish Basics',
                description: 'Basic Spanish vocabulary for beginners',
                primaryLanguage: 'en',
                targetLanguage: 'es',
                color: '#4361ee',
                isPublic: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                cards: [],
                stats: {
                    totalCards: 0,
                    masteredCards: 0,
                    lastStudied: null,
                    studyCount: 0
                }
            };
            
            app.decks.push(sampleDeck);
            app.saveDecks();
            app.renderDecks();
            app.selectDeck(sampleDeck.id);
        }
        
        const deck = app.getCurrentDeck();
        if (!deck) return;
        
        // Add sample cards if deck is empty
        if (deck.cards.length === 0) {
            const sampleCards = [
                {
                    front: 'Hello',
                    back: 'Hola',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'greetings',
                    difficulty: 'easy',
                    example: 'Hello, how are you?',
                    notes: 'Common greeting'
                },
                {
                    front: 'Goodbye',
                    back: 'Adiós',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'greetings',
                    difficulty: 'easy',
                    example: 'Goodbye, see you tomorrow!',
                    notes: 'Formal farewell'
                },
                {
                    front: 'Thank you',
                    back: 'Gracias',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'phrases',
                    difficulty: 'easy',
                    example: 'Thank you for your help',
                    notes: 'Expressing gratitude'
                },
                {
                    front: 'Please',
                    back: 'Por favor',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'phrases',
                    difficulty: 'easy',
                    example: 'Please pass the salt',
                    notes: 'Polite request'
                },
                {
                    front: 'Yes',
                    back: 'Sí',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'vocabulary',
                    difficulty: 'easy',
                    example: 'Yes, I understand',
                    notes: 'Affirmative response'
                },
                {
                    front: 'No',
                    back: 'No',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'vocabulary',
                    difficulty: 'easy',
                    example: 'No, thank you',
                    notes: 'Negative response'
                },
                {
                    front: 'Water',
                    back: 'Agua',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'vocabulary',
                    difficulty: 'medium',
                    example: 'Can I have a glass of water?',
                    notes: 'Essential noun'
                },
                {
                    front: 'Food',
                    back: 'Comida',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'vocabulary',
                    difficulty: 'medium',
                    example: 'The food is delicious',
                    notes: 'General term for food'
                },
                {
                    front: 'To eat',
                    back: 'Comer',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'verbs',
                    difficulty: 'medium',
                    example: 'I eat breakfast at 8 AM',
                    notes: 'Regular verb'
                },
                {
                    front: 'To drink',
                    back: 'Beber',
                    frontLanguage: 'en',
                    backLanguage: 'es',
                    category: 'verbs',
                    difficulty: 'medium',
                    example: 'I drink coffee every morning',
                    notes: 'Regular verb'
                }
            ];
            
            sampleCards.forEach((cardData, index) => {
                const card = {
                    id: `sample-card-${index + 1}`,
                    ...cardData,
                    mastered: false,
                    createdAt: new Date().toISOString(),
                    lastReviewed: null,
                    reviewCount: 0,
                    correctCount: 0,
                    incorrectCount: 0
                };
                
                deck.cards.push(card);
            });
            
            deck.stats.totalCards = deck.cards.length;
            deck.updatedAt = new Date().toISOString();
            
            app.saveDecks();
            app.renderCards();
            app.renderCardsList();
            app.updateDeckDetails();
            app.updateStats();
            app.showCard(0);
            
            app.showNotification('Sample data added successfully!', 'success');
        } else {
            app.showNotification('Deck already has cards. Sample data not added.', 'info');
        }
    }
});