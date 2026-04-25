document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const apiManager = new APIManager();
    
    const recipeManager = new RecipeManager(stateManager, eventBus, apiManager);
    const mealPlannerManager = new MealPlannerManager(stateManager, eventBus);
    const favoritesManager = new FavoritesManager(stateManager, eventBus, recipeManager);
    const shoppingListManager = new ShoppingListManager(stateManager, eventBus);
    const categoryFilter = new CategoryFilter(stateManager, eventBus, recipeManager);
    
    window.app = {
        stateManager,
        eventBus,
        recipeManager,
        mealPlannerManager,
        favoritesManager,
        shoppingListManager,
        categoryFilter
    };
    
    // Panel close handlers
    document.querySelectorAll('.close-panel').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.sidebar-panel').classList.remove('open');
        };
    });
    
    document.getElementById('mealPlannerBtn').onclick = () => mealPlannerManager.showPanel();
    
    // Modal close handlers
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => closeModal();
    });
    
    // Event listeners
    eventBus.on('toast', ({ message, type }) => {
        const toast = new NotificationToast();
        toast.show(message, type);
    });
    
    eventBus.on('mealplan:show', (recipe) => {
        const modal = document.getElementById('mealPlanModal');
        modal.dataset.recipeId = recipe.id;
        modal.classList.add('active');
        
        document.getElementById('confirmAddToMealPlanBtn').onclick = () => {
            const day = document.getElementById('mealDay').value;
            const type = document.getElementById('mealType').value;
            mealPlannerManager.addToMealPlan(recipe, day, type);
            closeModal();
        };
    });
    
    eventBus.on('mealplan:add', ({ day, type }) => {
        const modal = document.getElementById('mealPlanModal');
        document.getElementById('mealDay').value = day;
        document.getElementById('mealType').value = type;
        modal.classList.add('active');
        
        document.getElementById('confirmAddToMealPlanBtn').onclick = () => {
            const recipeId = modal.dataset.recipeId;
            const recipe = stateManager.get('recipes').find(r => r.id === recipeId);
            if (recipe) {
                mealPlannerManager.addToMealPlan(recipe, day, type);
            }
            closeModal();
        };
    });
    
    eventBus.on('shopping:add', (recipe) => {
        shoppingListManager.addFromRecipe(recipe);
    });
    
    // Update favorites count
    document.getElementById('favoritesCount').textContent = stateManager.get('favorites').length;
    
    console.log('Recipe App Initialized!');
});

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
}

class NotificationToast {
    constructor() {
        this.toastElement = document.getElementById('toast');
    }

    show(message, type = 'success', duration = 3000) {
        this.toastElement.textContent = message;
        this.toastElement.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toastElement.classList.remove('show');
        }, duration);
    }
}

window.closeModal = closeModal;
window.NotificationToast = NotificationToast;