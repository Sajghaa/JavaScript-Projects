// APIManager.js - Handles API calls to Spoonacular
class APIManager {
    constructor() {
        // Using free API - TheMealDB (no API key required)
        this.baseURL = 'https://www.themealdb.com/api/json/v1/1';
    }

    async searchRecipes(query, category = null, diet = null) {
        try {
            let url = `${this.baseURL}/search.php?s=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            let meals = data.meals || [];
            
            // Filter by category
            if (category && category !== 'all') {
                meals = meals.filter(meal => meal.strCategory === category);
            }
            
            // Transform to consistent format
            return meals.map(meal => this.transformRecipe(meal));
        } catch (error) {
            console.error('API Error:', error);
            return this.getSampleRecipes();
        }
    }

    async getRecipeById(id) {
        try {
            const response = await fetch(`${this.baseURL}/lookup.php?i=${id}`);
            const data = await response.json();
            
            if (data.meals && data.meals[0]) {
                return this.transformRecipe(data.meals[0]);
            }
            return null;
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }

    async getRandomRecipes(count = 12) {
        try {
            const recipes = [];
            for (let i = 0; i < Math.min(count, 6); i++) {
                const response = await fetch(`${this.baseURL}/random.php`);
                const data = await response.json();
                if (data.meals && data.meals[0]) {
                    recipes.push(this.transformRecipe(data.meals[0]));
                }
            }
            return recipes;
        } catch (error) {
            console.error('API Error:', error);
            return this.getSampleRecipes();
        }
    }

    async getRecipesByCategory(category) {
        try {
            const response = await fetch(`${this.baseURL}/filter.php?c=${encodeURIComponent(category)}`);
            const data = await response.json();
            
            const meals = data.meals || [];
            const fullRecipes = [];
            
            for (const meal of meals.slice(0, 12)) {
                const recipe = await this.getRecipeById(meal.idMeal);
                if (recipe) fullRecipes.push(recipe);
            }
            
            return fullRecipes;
        } catch (error) {
            console.error('API Error:', error);
            return this.getSampleRecipes();
        }
    }

    transformRecipe(apiRecipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = apiRecipe[`strIngredient${i}`];
            const measure = apiRecipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    amount: measure || '',
                    original: `${measure} ${ingredient}`.trim()
                });
            }
        }
        
        return {
            id: apiRecipe.idMeal,
            title: apiRecipe.strMeal,
            image: apiRecipe.strMealThumb,
            category: apiRecipe.strCategory || 'Uncategorized',
            area: apiRecipe.strArea,
            instructions: apiRecipe.strInstructions,
            ingredients: ingredients,
            youtube: apiRecipe.strYoutube,
            source: apiRecipe.strSource,
            tags: apiRecipe.strTags ? apiRecipe.strTags.split(',') : [],
            time: this.estimateTime(apiRecipe.strCategory),
            rating: (Math.random() * 2 + 3).toFixed(1)
        };
    }

    estimateTime(category) {
        const times = {
            'Breakfast': 15,
            'Lunch': 30,
            'Dinner': 45,
            'Dessert': 40,
            'Vegetarian': 30,
            'Vegan': 35
        };
        return times[category] || 30;
    }

    getSampleRecipes() {
        return [
            {
                id: '1',
                title: 'Spaghetti Carbonara',
                image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
                category: 'Pasta',
                time: 25,
                rating: 4.5,
                instructions: 'Cook pasta. Fry pancetta. Mix eggs and cheese. Combine.',
                ingredients: [
                    { name: 'Spaghetti', amount: '200g' },
                    { name: 'Eggs', amount: '2' },
                    { name: 'Pancetta', amount: '100g' },
                    { name: 'Parmesan', amount: '50g' }
                ]
            },
            {
                id: '2',
                title: 'Chicken Curry',
                image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
                category: 'Curry',
                time: 40,
                rating: 4.7,
                instructions: 'Sauté onions, add spices, cook chicken, add coconut milk.',
                ingredients: [
                    { name: 'Chicken', amount: '500g' },
                    { name: 'Onions', amount: '2' },
                    { name: 'Coconut Milk', amount: '400ml' },
                    { name: 'Curry Powder', amount: '2 tbsp' }
                ]
            }
        ];
    }
}

window.APIManager = APIManager;