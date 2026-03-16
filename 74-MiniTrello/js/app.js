import { StateManager } from './core/StateManager.js';
import { EventBus } from './core/EventBus.js';
import { StorageManager } from './core/StorageManager.js';
import { BoardManager } from './modules/BoardManager.js';
import { ListManager } from './modules/ListManager.js';
import { CardManager } from './modules/CardManager.js';
import { DragDropManager } from './modules/DragDropManager.js';
import { ModalManager } from './modules/ModalManager.js';
import { BoardComponent } from './components/BoardComponent.js';
import { ListComponent } from './components/ListComponent.js';
import { CardComponent } from './components/CardComponent.js';

class TrelloApp {
    constructor() {
        this.stateManager = new StateManager();
        this.eventBus = new EventBus();
        
        this.initializeModules();
        this.initializeUI();
        this.setupEventListeners();
        this.loadInitialData();
    }

    initializeModules() {
        this.boardManager = new BoardManager(this.stateManager, this.eventBus);
        this.listManager = new ListManager(this.stateManager, this.eventBus);
        this.cardManager = new CardManager(this.stateManager, this.eventBus);
        this.dragDropManager = new DragDropManager(this.stateManager, this.eventBus);
        this.modalManager = new ModalManager(this.stateManager, this.eventBus);
        
        this.boardComponent = new BoardComponent(this.stateManager, this.eventBus);
        this.listComponent = new ListComponent(this.stateManager, this.eventBus);
        this.cardComponent = new CardComponent(this.stateManager, this.eventBus);
    }

    initializeUI() {
        // Create board button
        document.getElementById('createBoardBtn').addEventListener('click', () => {
            this.modalManager.showCreateBoardModal();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modalManager.closeAllModals();
            });
        });

        // Click outside modal
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.modalManager.closeAllModals();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new board
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.modalManager.showCreateBoardModal();
            }
            
            // Ctrl/Cmd + Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.stateManager.undo();
                this.showToast('Undo', 'info');
            }
            
            // Ctrl/Cmd + Shift + Z for redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.stateManager.redo();
                this.showToast('Redo', 'info');
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.modalManager.closeAllModals();
            }
        });

        // Event listeners from modules
        this.eventBus.on('board:created', (board) => {
            this.loadBoards();
            this.showToast(`Board "${board.title}" created!`, 'success');
        });

        this.eventBus.on('board:deleted', () => {
            this.loadBoards();
            this.showToast('Board deleted', 'info');
        });

        this.eventBus.on('list:created', (list) => {
            this.loadCurrentBoard();
            this.showToast(`List "${list.title}" created`, 'success');
        });

        this.eventBus.on('card:created', (card) => {
            this.loadCurrentBoard();
            this.showToast(`Card "${card.title}" created`, 'success');
        });

        this.eventBus.on('card:updated', () => {
            this.loadCurrentBoard();
        });

        this.eventBus.on('card:deleted', () => {
            this.loadCurrentBoard();
            this.showToast('Card deleted', 'info');
        });

        this.eventBus.on('card:moved', () => {
            this.loadCurrentBoard();
        });

        this.eventBus.on('error', (error) => {
            this.showToast(error.message, 'error');
        });
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.showToast('You are back online!', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline. Changes will be saved locally.', 'warning');
        });

        // Before unload
        window.addEventListener('beforeunload', () => {
            this.stateManager.saveToStorage();
        });
    }

    loadInitialData() {
        this.loadBoards();
        this.loadCurrentBoard();
    }

    loadBoards() {
        const boards = this.stateManager.get('boards');
        const currentBoard = this.stateManager.get('currentBoard');
        
        const nav = document.getElementById('boardsNav');
        nav.innerHTML = `
            ${boards.map(board => `
                <div class="board-nav-item ${board.id === currentBoard ? 'active' : ''}" 
                     data-board-id="${board.id}"
                     onclick="app.switchBoard('${board.id}')">
                    <span class="board-color" style="background: ${board.color}"></span>
                    <span>${board.title}</span>
                </div>
            `).join('')}
        `;
    }

    loadCurrentBoard() {
        const boardId = this.stateManager.get('currentBoard');
        if (!boardId) return;

        const container = document.getElementById('boardsContainer');
        container.innerHTML = this.boardComponent.render(boardId);
        
        // Initialize drag and drop
        this.dragDropManager.initialize();
    }

    switchBoard(boardId) {
        this.stateManager.set('currentBoard', boardId);
        this.loadBoards();
        this.loadCurrentBoard();
        
        this.eventBus.emit('board:switched', boardId);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Global functions for onclick handlers
    static initGlobalFunctions(app) {
        window.app = app;
        window.closeModal = () => app.modalManager.closeAllModals();
        window.addChecklistItem = (btn) => {
            const input = btn.previousElementSibling;
            if (input.value.trim()) {
                app.cardManager.addChecklistItem(input.value.trim());
                input.value = '';
            }
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TrelloApp();
    TrelloApp.initGlobalFunctions(app);
    app.loadTheme();
});