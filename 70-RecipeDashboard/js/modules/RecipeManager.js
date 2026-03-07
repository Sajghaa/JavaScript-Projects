import { RecipeAPI } from './RecipeAPI.js';

export class RecipeManager {
    constructor(stateManager, uiManager) {
        this.api = new RecipeAPI();
        this.stateManager = stateManager;
        this.uiManager = uiManager;
        this.initEventListeners();
    }

    // Initialize event listeners
    initEventListeners() {
        document.addEventListener('recipeSearch', async (e) => {
            await this.searchRecipes(e.detail.query, e.detail.filters);
        });

        document.addEventListener('loadMoreRecipes', async () => {
            await this.loadMoreRecipes();
        });
    }

    // Search recipes
    async searchRecipes(query, filters) {
        this.stateManager.set('loading', true);
        this.stateManager.set('error', null);
        
        try {
            // Fetch recipes based on search
            let recipes = await this.api.searchRecipes(query);
            
            // Apply filters
            recipes = this.applyFilters(recipes, filters);
            
            this.stateManager.update({
                recipes: recipes.slice(0, 12),
                hasMore: recipes.length > 12,
                currentPage: 1
            });
            
            if (recipes.length === 0) {
                this.stateManager.set('error', 'No recipes found. Try a different search!');
            }
        } catch (error) {
            this.stateManager.set('error', error.message);
        } finally {
            this.stateManager.set('loading', false);
        }
    }

    // Load more recipes
    async loadMoreRecipes() {
        const currentPage = this.stateManager.get('currentPage');
        const currentRecipes = this.stateManager.get('recipes');
        const currentSearch = this.stateManager.get('currentSearch');
        const filters = this.stateManager.get('currentFilters');
        
        this.stateManager.set('loading', true);
        
        try {
            let allRecipes = await this.api.searchRecipes(currentSearch);
            allRecipes = this.applyFilters(allRecipes, filters);
            
            const nextPage = currentPage + 1;
            const start = currentPage * 12;
            const end = nextPage * 12;
            const newRecipes = allRecipes.slice(start, end);
            
            if (newRecipes.length > 0) {
                this.stateManager.update({
                    recipes: [...currentRecipes, ...newRecipes],
                    currentPage: nextPage,
                    hasMore: end < allRecipes.length
                });
            } else {
                this.stateManager.set('hasMore', false);
            }
        } catch (error) {
            this.stateManager.set('error', error.message);
        } finally {
            this.stateManager.set('loading', false);
        }
    }

    // Apply filters to recipes
    applyFilters(recipes, filters) {
        return recipes.filter(recipe => {
            // Filter by meal type (category)
            if (filters.mealType && recipe.strCategory) {
                const matchesCategory = recipe.strCategory.toLowerCase() === filters.mealType.toLowerCase();
                if (!matchesCategory) return false;
            }
            
            // Filter by cuisine (area)
            if (filters.cuisineType && recipe.strArea) {
                const matchesCuisine = recipe.strArea.toLowerCase() === filters.cuisineType.toLowerCase();
                if (!matchesCuisine) return false;
            }
            
            // Filter by diet (simplified - check tags and categories)
            if (filters.dietType) {
                const tags = recipe.strTags ? recipe.strTags.toLowerCase() : '';
                const category = recipe.strCategory ? recipe.strCategory.toLowerCase() : '';
                
                switch (filters.dietType) {
                    case 'vegetarian':
                        if (!tags.includes('vegetarian') && !category.includes('vegetarian')) {
                            return false;
                        }
                        break;
                    case 'vegan':
                        if (!tags.includes('vegan')) {
                            return false;
                        }
                        break;
                    case 'gluten-free':
                        if (!tags.includes('gluten') && !tags.includes('gluten free')) {
                            return false;
                        }
                        break;
                }
            }
            
            return true;
        });
    }

    // Get random recipes for initial load
    async loadRandomRecipes() {
        this.stateManager.set('loading', true);
        
        try {
            const recipes = await this.api.getRandomRecipes(12);
            this.stateManager.update({
                recipes: recipes,
                hasMore: false,
                currentPage: 1
            });
        } catch (error) {
            this.stateManager.set('error', error.message);
        } finally {
            this.stateManager.set('loading', false);
        }
    }

    // Clear search
    clearSearch() {
        this.stateManager.resetSearch();
        this.loadRandomRecipes();
    }
}