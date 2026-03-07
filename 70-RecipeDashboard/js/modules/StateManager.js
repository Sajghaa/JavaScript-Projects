export class StateManager {
    constructor() {
        this.state = {
            recipes: [],
            favorites: this.loadFavorites(),
            currentSearch: '',
            currentFilters: {
                mealType: '',
                dietType: '',
                cuisineType: ''
            },
            loading: false,
            error: null,
            currentPage: 1,
            hasMore: true
        };
        
        this.listeners = new Map();
        this.persistStates = ['favorites']; // States to persist
    }

    // Get state
    get(key) {
        return this.state[key];
    }

    // Set state
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Persist if needed
        if (this.persistStates.includes(key)) {
            this.persistState(key, value);
        }
        
        this.notifyListeners(key, value, oldValue);
    }

    // Update multiple states
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(key, newValue, oldValue) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    // Load favorites from localStorage
    loadFavorites() {
        try {
            const saved = localStorage.getItem('recipeFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    // Persist state to localStorage
    persistState(key, value) {
        try {
            localStorage.setItem(`recipe${key.charAt(0).toUpperCase() + key.slice(1)}`, JSON.stringify(value));
        } catch (error) {
            console.error(`Error persisting ${key}:`, error);
        }
    }

    // Add to favorites
    addFavorite(recipe) {
        const favorites = [...this.state.favorites];
        
        // Check if already exists
        if (!favorites.some(fav => fav.idMeal === recipe.idMeal)) {
            favorites.push({
                idMeal: recipe.idMeal,
                strMeal: recipe.strMeal,
                strMealThumb: recipe.strMealThumb,
                strCategory: recipe.strCategory,
                strArea: recipe.strArea,
                strTags: recipe.strTags,
                dateAdded: new Date().toISOString()
            });
            
            this.set('favorites', favorites);
            return true;
        }
        
        return false;
    }

    // Remove from favorites
    removeFavorite(recipeId) {
        const favorites = this.state.favorites.filter(fav => fav.idMeal !== recipeId);
        this.set('favorites', favorites);
    }

    // Check if recipe is favorite
    isFavorite(recipeId) {
        return this.state.favorites.some(fav => fav.idMeal === recipeId);
    }

    // Clear all state
    clear() {
        this.state = {
            recipes: [],
            favorites: this.state.favorites, // Preserve favorites
            currentSearch: '',
            currentFilters: {
                mealType: '',
                dietType: '',
                cuisineType: ''
            },
            loading: false,
            error: null,
            currentPage: 1,
            hasMore: true
        };
        
        this.notifyListeners('*', this.state);
    }

    // Reset search state
    resetSearch() {
        this.update({
            recipes: [],
            currentPage: 1,
            hasMore: true,
            currentSearch: '',
            error: null
        });
    }
}