class StateManager {
    constructor() {
        this.state = {
            recipes: [],
            favorites: [],
            mealPlan: {
                startDate: this.getStartOfWeek(),
                meals: {}
            },
            shoppingList: [],
            filters: {
                category: 'all',
                diet: null,
                searchQuery: ''
            },
            pagination: {
                currentPage: 1,
                totalResults: 0,
                hasMore: false
            },
            ui: {
                activePanel: null,
                selectedRecipe: null
            }
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
    }

    getStartOfWeek() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.setDate(diff)).toISOString().split('T')[0];
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        const oldValue = target[lastKey];
        
        target[lastKey] = value;
        this.notifyListeners(path, value, oldValue);
        this.saveToStorage();
        
        const event = new CustomEvent('stateChanged', { detail: { path, value } });
        document.dispatchEvent(event);
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => callback(value, oldValue));
        }
    }

    // Favorites
    addFavorite(recipe) {
        if (!this.state.favorites.find(f => f.id === recipe.id)) {
            this.state.favorites.push(recipe);
            this.notifyListeners('favorites', this.state.favorites);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    removeFavorite(recipeId) {
        this.state.favorites = this.state.favorites.filter(f => f.id !== recipeId);
        this.notifyListeners('favorites', this.state.favorites);
        this.saveToStorage();
    }

    isFavorite(recipeId) {
        return this.state.favorites.some(f => f.id === recipeId);
    }

    // Meal Plan
    addToMealPlan(recipe, day, mealType) {
        const key = `${day}_${mealType}`;
        this.state.mealPlan.meals[key] = recipe;
        this.notifyListeners('mealPlan', this.state.mealPlan);
        this.saveToStorage();
    }

    removeFromMealPlan(day, mealType) {
        const key = `${day}_${mealType}`;
        delete this.state.mealPlan.meals[key];
        this.notifyListeners('mealPlan', this.state.mealPlan);
        this.saveToStorage();
    }

    getMealForDay(day, mealType) {
        const key = `${day}_${mealType}`;
        return this.state.mealPlan.meals[key];
    }

    // Shopping List
    addToShoppingList(item) {
        const existing = this.state.shoppingList.find(i => 
            i.name.toLowerCase() === item.name.toLowerCase()
        );
        
        if (existing) {
            existing.quantity = item.quantity;
        } else {
            this.state.shoppingList.push({ ...item, id: Date.now().toString(), checked: false });
        }
        
        this.notifyListeners('shoppingList', this.state.shoppingList);
        this.saveToStorage();
    }

    removeFromShoppingList(itemId) {
        this.state.shoppingList = this.state.shoppingList.filter(i => i.id !== itemId);
        this.notifyListeners('shoppingList', this.state.shoppingList);
        this.saveToStorage();
    }

    toggleShoppingItem(itemId) {
        const item = this.state.shoppingList.find(i => i.id === itemId);
        if (item) {
            item.checked = !item.checked;
            this.notifyListeners('shoppingList', this.state.shoppingList);
            this.saveToStorage();
        }
    }

    clearShoppingList() {
        this.state.shoppingList = [];
        this.notifyListeners('shoppingList', this.state.shoppingList);
        this.saveToStorage();
    }

    saveToStorage() {
        try {
            localStorage.setItem('recipe_app_state', JSON.stringify({
                favorites: this.state.favorites,
                mealPlan: this.state.mealPlan,
                shoppingList: this.state.shoppingList
            }));
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('recipe_app_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.favorites = data.favorites || [];
                this.state.mealPlan = data.mealPlan || this.state.mealPlan;
                this.state.shoppingList = data.shoppingList || [];
            }
        } catch (error) {
            console.error('Error loading:', error);
        }
    }
}

window.StateManager = StateManager;