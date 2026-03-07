import { StateManager } from './modules/StateManager.js';
import { UIManager } from './modules/UIManager.js';
import { RecipeManager } from './modules/RecipeManager.js';

class RecipeApp {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
        this.recipeManager = new RecipeManager(this.stateManager, this.uiManager);
        
        this.initialize();
    }

    async initialize() {
        // Load theme
        this.uiManager.loadTheme();
        
        // Load initial random recipes
        await this.recipeManager.loadRandomRecipes();
        
        // Show welcome message
        this.uiManager.showToast('Welcome to Recipe Dashboard! 🍳', 'success');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeApp();
});