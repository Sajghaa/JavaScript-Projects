
export class RecipeAPI {
    constructor() {
        this.baseURL = 'https://www.themealdb.com/api/json/v1/1';
        this.cache = new Map();
        this.rateLimit = {
            lastCall: 0,
            minInterval: 1000 // 1 second between calls
        };
    }

    // Rate limiting
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastCall = now - this.rateLimit.lastCall;
        
        if (timeSinceLastCall < this.rateLimit.minInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.rateLimit.minInterval - timeSinceLastCall)
            );
        }
        
        this.rateLimit.lastCall = Date.now();
    }

    // Search recipes by name
    async searchRecipes(query) {
        if (!query.trim()) return [];
        
        const cacheKey = `search_${query}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.waitForRateLimit();
        
        try {
            const response = await fetch(`${this.baseURL}/search.php?s=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            const recipes = data.meals || [];
            this.cache.set(cacheKey, recipes);
            return recipes;
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw new Error('Failed to search recipes. Please try again.');
        }
    }

    // Get recipe by ID
    async getRecipeById(id) {
        const cacheKey = `recipe_${id}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.waitForRateLimit();
        
        try {
            const response = await fetch(`${this.baseURL}/lookup.php?i=${id}`);
            const data = await response.json();
            
            const recipe = data.meals?.[0] || null;
            if (recipe) {
                this.cache.set(cacheKey, recipe);
            }
            return recipe;
        } catch (error) {
            console.error('Error fetching recipe:', error);
            throw new Error('Failed to fetch recipe details.');
        }
    }

    // Filter by category
    async filterByCategory(category) {
        if (!category) return [];
        
        const cacheKey = `category_${category}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.waitForRateLimit();
        
        try {
            const response = await fetch(`${this.baseURL}/filter.php?c=${encodeURIComponent(category)}`);
            const data = await response.json();
            
            const recipes = data.meals || [];
            this.cache.set(cacheKey, recipes);
            return recipes;
        } catch (error) {
            console.error('Error filtering by category:', error);
            throw new Error('Failed to filter recipes.');
        }
    }

    // Filter by area/cuisine
    async filterByArea(area) {
        if (!area) return [];
        
        const cacheKey = `area_${area}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        await this.waitForRateLimit();
        
        try {
            const response = await fetch(`${this.baseURL}/filter.php?a=${encodeURIComponent(area)}`);
            const data = await response.json();
            
            const recipes = data.meals || [];
            this.cache.set(cacheKey, recipes);
            return recipes;
        } catch (error) {
            console.error('Error filtering by area:', error);
            throw new Error('Failed to filter recipes.');
        }
    }

    // Get random recipe
    async getRandomRecipe() {
        await this.waitForRateLimit();
        
        try {
            const response = await fetch(`${this.baseURL}/random.php`);
            const data = await response.json();
            return data.meals?.[0] || null;
        } catch (error) {
            console.error('Error fetching random recipe:', error);
            throw new Error('Failed to fetch random recipe.');
        }
    }

    // Get multiple random recipes
    async getRandomRecipes(count = 6) {
        const recipes = [];
        const promises = [];
        
        for (let i = 0; i < count; i++) {
            promises.push(this.getRandomRecipe());
        }
        
        const results = await Promise.allSettled(promises);
        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                recipes.push(result.value);
            }
        });
        
        return recipes;
    }

    // Get recipe ingredients
    static parseIngredients(recipe) {
        const ingredients = [];
        
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    measure: measure || ''
                });
            }
        }
        
        return ingredients;
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}