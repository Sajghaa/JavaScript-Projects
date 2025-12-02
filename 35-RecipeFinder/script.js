class RecipeFinder {
    constructor() {
        // API Configuration
        this.apiKey = 'bef9dd160f254fd294788bacaaa539b7'; // Replace with your actual API key
        this.apiBaseUrl = 'https://api.spoonacular.com/recipes';
        this.apiTimeout = 10000; 
        
        this.useMockData = true; 
        

        this.currentPage = 1;
        this.totalPages = 1;
        this.totalResults = 0;
        this.selectedIngredients = [];
        this.favoriteRecipes = new Set();
        this.activeFilters = {
            diet: [],
            mealType: [],
            cuisine: [],
            maxReadyTime: 60
        };
        this.currentSort = 'relevance';
        this.isLoading = false;
        this.recipes = [];
        this.filteredRecipes = [];
        
        // DOM Elements
        this.elements = {
            // Search elements
            ingredientInput: document.getElementById('ingredientInput'),
            searchBtn: document.getElementById('searchBtn'),
            selectedIngredients: document.getElementById('selectedIngredients'),
            suggestions: document.getElementById('suggestions'),
            
            // Quick ingredients
            quickIngredients: document.querySelectorAll('.quick-ingredient'),
            
            // Navigation
            homeLink: document.getElementById('homeLink'),
            favoritesLink: document.getElementById('favoritesLink'),
            randomLink: document.getElementById('randomLink'),
            favoriteCount: document.querySelector('.favorite-count'),
            
            // Filters
            filterTags: document.querySelectorAll('.filter-tag'),
            cookingTime: document.getElementById('cookingTime'),
            timeValue: document.getElementById('timeValue'),
            clearFilters: document.getElementById('clearFilters'),
            activeFilters: document.getElementById('activeFilters'),
            
            // Sort
            sortSelect: document.getElementById('sortSelect'),
            
            // Results
            recipesContainer: document.getElementById('recipesContainer'),
            resultsTitle: document.getElementById('resultsTitle'),
            resultsCount: document.getElementById('resultsCount'),
            
            // Pagination
            prevPageBtn: document.getElementById('prevPage'),
            nextPageBtn: document.getElementById('nextPage'),
            currentPageSpan: document.getElementById('currentPage'),
            totalPagesSpan: document.getElementById('totalPages'),
            
            // State elements
            loading: document.getElementById('loading'),
            errorContainer: document.getElementById('errorContainer'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            noResults: document.getElementById('noResults'),
            resetSearchBtn: document.getElementById('resetSearchBtn'),
            
            // Modal
            recipeModal: document.getElementById('recipeModal'),
            modalBody: document.getElementById('modalBody'),
            
            // Featured section
            featuredSection: document.getElementById('featuredSection'),
            featuredContainer: document.getElementById('featuredContainer'),
            
            // Theme toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // Back to top
            backToTop: document.getElementById('backToTop')
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadFavorites();
        this.setupTheme();
        this.loadPopularRecipes();
        this.setupAutoSuggest();
    }
    
    setupEventListeners() {
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.searchRecipes());
        this.elements.ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addIngredient();
                this.searchRecipes();
            }
        });
        
        // Quick ingredients
        this.elements.quickIngredients.forEach(button => {
            button.addEventListener('click', (e) => {
                const ingredient = e.target.dataset.ingredient;
                this.addIngredient(ingredient);
            });
        });
        
        // Navigation
        this.elements.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadPopularRecipes();
            this.setActiveNav('home');
        });
        
        this.elements.favoritesLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showFavorites();
            this.setActiveNav('favorites');
        });
        
        this.elements.randomLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadRandomRecipe();
            this.setActiveNav('random');
        });
        
        // Filter events
        this.elements.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => this.toggleFilter(e));
        });
        
        this.elements.cookingTime.addEventListener('input', (e) => {
            this.elements.timeValue.textContent = `${e.target.value} min`;
            this.activeFilters.maxReadyTime = parseInt(e.target.value);
            this.applyFilters();
        });
        
        this.elements.clearFilters.addEventListener('click', () => this.clearAllFilters());
        
        // Sort
        this.elements.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.sortRecipes();
        });
        
        // Pagination
        this.elements.prevPageBtn.addEventListener('click', () => this.previousPage());
        this.elements.nextPageBtn.addEventListener('click', () => this.nextPage());
        
        // Error handling
        this.elements.retryBtn.addEventListener('click', () => this.retryLastAction());
        this.elements.resetSearchBtn.addEventListener('click', () => this.resetSearch());
        
        // Modal
        this.elements.recipeModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close') ||
                e.target.closest('.modal-close')) {
                this.closeModal();
            }
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Back to top
        this.elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.recipeModal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    setupAutoSuggest() {
        const commonIngredients = [
            'chicken', 'beef', 'pork', 'fish', 'shrimp',
            'rice', 'pasta', 'bread', 'potatoes', 'onions',
            'garlic', 'tomatoes', 'carrots', 'broccoli', 'spinach',
            'cheese', 'eggs', 'milk', 'butter', 'oil',
            'salt', 'pepper', 'sugar', 'flour', 'eggs',
            'lemons', 'apples', 'bananas', 'strawberries', 'blueberries'
        ];
        
        this.elements.ingredientInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase().trim();
            
            if (value.length < 2) {
                this.elements.suggestions.style.display = 'none';
                return;
            }
            
            const matches = commonIngredients.filter(ingredient => 
                ingredient.includes(value) && !this.selectedIngredients.includes(ingredient)
            );
            
            if (matches.length > 0) {
                this.elements.suggestions.innerHTML = matches
                    .map(ingredient => `
                        <div class="suggestion-item" data-ingredient="${ingredient}">
                            ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                        </div>
                    `)
                    .join('');
                
                this.elements.suggestions.style.display = 'block';
                
                // Add click events to suggestions
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const ingredient = e.target.dataset.ingredient;
                        this.addIngredient(ingredient);
                        this.elements.suggestions.style.display = 'none';
                        this.elements.ingredientInput.value = '';
                    });
                });
            } else {
                this.elements.suggestions.style.display = 'none';
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-container')) {
                this.elements.suggestions.style.display = 'none';
            }
        });
    }
    
    addIngredient(ingredient = null) {
        let ingredientToAdd = ingredient || this.elements.ingredientInput.value.trim().toLowerCase();
        
        if (!ingredientToAdd) return;
        
        // Clean up ingredient name
        ingredientToAdd = ingredientToAdd.replace(/,/g, '').trim();
        
        if (ingredientToAdd && !this.selectedIngredients.includes(ingredientToAdd)) {
            this.selectedIngredients.push(ingredientToAdd);
            this.renderSelectedIngredients();
            this.elements.ingredientInput.value = '';
            this.elements.suggestions.style.display = 'none';
        }
    }
    
    removeIngredient(ingredient) {
        this.selectedIngredients = this.selectedIngredients.filter(item => item !== ingredient);
        this.renderSelectedIngredients();
    }
    
    renderSelectedIngredients() {
        this.elements.selectedIngredients.innerHTML = this.selectedIngredients
            .map(ingredient => `
                <div class="selected-ingredient">
                    <span>${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}</span>
                    <button onclick="recipeFinder.removeIngredient('${ingredient}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `)
            .join('');
    }
    
    async searchRecipes() {
        if (this.selectedIngredients.length === 0) {
            this.showError('Please add at least one ingredient');
            return;
        }
        
        this.showLoading();
        this.hideError();
        this.hideNoResults();
        
        try {
            const ingredients = this.selectedIngredients.join(',');
            const diet = this.activeFilters.diet.join(',');
            const type = this.activeFilters.mealType.join(',');
            const cuisine = this.activeFilters.cuisine.join(',');
            const maxReadyTime = this.activeFilters.maxReadyTime;
            
            let url;
            
            if (this.useMockData) {
                // Use mock data for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.recipes = this.generateMockRecipes();
                this.filteredRecipes = [...this.recipes];
            } else {
                // Real API call (requires API key)
                url = `${this.apiBaseUrl}/complexSearch?apiKey=${this.apiKey}&includeIngredients=${ingredients}&diet=${diet}&type=${type}&cuisine=${cuisine}&maxReadyTime=${maxReadyTime}&number=20&addRecipeInformation=true`;
                
                const response = await this.fetchWithTimeout(url);
                const data = await response.json();
                
                this.recipes = data.results || [];
                this.filteredRecipes = [...this.recipes];
            }
            
            if (this.recipes.length > 0) {
                this.elements.resultsTitle.textContent = `Recipes with ${this.selectedIngredients.join(', ')}`;
                this.sortRecipes();
                this.updateResultsCount();
                this.hideFeaturedSection();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadPopularRecipes() {
        this.showLoading();
        this.hideError();
        this.hideNoResults();
        
        try {
            let url;
            
            if (this.useMockData) {
                // Use mock data for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.recipes = this.generateMockRecipes();
                this.filteredRecipes = [...this.recipes];
            } else {
                // Real API call (requires API key)
                url = `${this.apiBaseUrl}/complexSearch?apiKey=${this.apiKey}&sort=popularity&number=20&addRecipeInformation=true`;
                
                const response = await this.fetchWithTimeout(url);
                const data = await response.json();
                
                this.recipes = data.results || [];
                this.filteredRecipes = [...this.recipes];
            }
            
            if (this.recipes.length > 0) {
                this.elements.resultsTitle.textContent = 'Popular Recipes';
                this.sortRecipes();
                this.updateResultsCount();
                this.loadFeaturedRecipes();
            }
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadRandomRecipe() {
        this.showLoading();
        this.hideError();
        
        try {
            let recipe;
            
            if (this.useMockData) {
                // Use mock data for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockRecipes = this.generateMockRecipes();
                recipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
            } else {
                // Real API call (requires API key)
                const url = `${this.apiBaseUrl}/random?apiKey=${this.apiKey}&number=1`;
                const response = await this.fetchWithTimeout(url);
                const data = await response.json();
                recipe = data.recipes[0];
            }
            
            this.showRecipeDetails(recipe);
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async loadFeaturedRecipes() {
        try {
            if (this.useMockData) {
                const featuredRecipes = this.generateMockRecipes().slice(0, 5);
                this.renderFeaturedRecipes(featuredRecipes);
            } else {
                // Real API call (requires API key)
                const url = `${this.apiBaseUrl}/complexSearch?apiKey=${this.apiKey}&sort=popularity&number=5&addRecipeInformation=true`;
                const response = await this.fetchWithTimeout(url);
                const data = await response.json();
                this.renderFeaturedRecipes(data.results || []);
            }
            
            this.showFeaturedSection();
        } catch (error) {
            console.error('Error loading featured recipes:', error);
            this.hideFeaturedSection();
        }
    }
    
    toggleFilter(e) {
        const button = e.currentTarget;
        const filterType = button.dataset.filter;
        const filterValue = button.dataset.value;
        
        button.classList.toggle('active');
        
        if (button.classList.contains('active')) {
            if (!this.activeFilters[filterType].includes(filterValue)) {
                this.activeFilters[filterType].push(filterValue);
            }
        } else {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(
                value => value !== filterValue
            );
        }
        
        this.updateActiveFiltersDisplay();
        this.applyFilters();
    }
    
    applyFilters() {
        this.filteredRecipes = this.recipes.filter(recipe => {
            // Time filter
            if (recipe.readyInMinutes > this.activeFilters.maxReadyTime) {
                return false;
            }
            
            // Diet filters
            if (this.activeFilters.diet.length > 0) {
                const recipeDiets = recipe.diets || [];
                const hasMatchingDiet = this.activeFilters.diet.some(diet => 
                    recipeDiets.includes(diet) || recipeDiets.includes(diet.replace('-', ''))
                );
                if (!hasMatchingDiet) return false;
            }
            
            // Meal type filters
            if (this.activeFilters.mealType.length > 0) {
                const recipeMealTypes = recipe.dishTypes || [];
                const hasMatchingMealType = this.activeFilters.mealType.some(type => 
                    recipeMealTypes.includes(type)
                );
                if (!hasMatchingMealType) return false;
            }
            
            // Cuisine filters
            if (this.activeFilters.cuisine.length > 0) {
                const recipeCuisines = recipe.cuisines || [];
                const hasMatchingCuisine = this.activeFilters.cuisine.some(cuisine => 
                    recipeCuisines.includes(cuisine)
                );
                if (!hasMatchingCuisine) return false;
            }
            
            return true;
        });
        
        this.sortRecipes();
        this.updateResultsCount();
        
        if (this.filteredRecipes.length === 0) {
            this.showNoResults();
        } else {
            this.hideNoResults();
        }
    }
    
    clearAllFilters() {
        // Clear selected ingredients
        this.selectedIngredients = [];
        this.renderSelectedIngredients();
        
        // Clear filter buttons
        this.elements.filterTags.forEach(tag => tag.classList.remove('active'));
        
        // Reset active filters
        this.activeFilters = {
            diet: [],
            mealType: [],
            cuisine: [],
            maxReadyTime: 60
        };
        
        // Reset cooking time slider
        this.elements.cookingTime.value = 60;
        this.elements.timeValue.textContent = '60 min';
        
        // Update display
        this.updateActiveFiltersDisplay();
        this.applyFilters();
    }
    
    updateActiveFiltersDisplay() {
        const activeFilters = [];
        
        // Add diet filters
        this.activeFilters.diet.forEach(diet => {
            activeFilters.push(`
                <div class="active-filter">
                    <span>${this.formatFilterName(diet)}</span>
                    <button onclick="recipeFinder.removeActiveFilter('diet', '${diet}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });
        
        // Add meal type filters
        this.activeFilters.mealType.forEach(type => {
            activeFilters.push(`
                <div class="active-filter">
                    <span>${this.formatFilterName(type)}</span>
                    <button onclick="recipeFinder.removeActiveFilter('mealType', '${type}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });
        
        // Add cuisine filters
        this.activeFilters.cuisine.forEach(cuisine => {
            activeFilters.push(`
                <div class="active-filter">
                    <span>${this.formatFilterName(cuisine)}</span>
                    <button onclick="recipeFinder.removeActiveFilter('cuisine', '${cuisine}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });
        
        // Add cooking time filter
        if (this.activeFilters.maxReadyTime < 180) {
            activeFilters.push(`
                <div class="active-filter">
                    <span>≤ ${this.activeFilters.maxReadyTime} min</span>
                    <button onclick="recipeFinder.removeActiveFilter('maxReadyTime', '${this.activeFilters.maxReadyTime}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        }
        
        this.elements.activeFilters.innerHTML = activeFilters.join('');
    }
    
    removeActiveFilter(type, value) {
        if (type === 'maxReadyTime') {
            this.activeFilters.maxReadyTime = 180;
            this.elements.cookingTime.value = 180;
            this.elements.timeValue.textContent = '180 min';
        } else {
            this.activeFilters[type] = this.activeFilters[type].filter(v => v !== value);
            
            // Update filter button state
            document.querySelectorAll(`[data-filter="${type}"][data-value="${value}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        this.updateActiveFiltersDisplay();
        this.applyFilters();
    }
    
    sortRecipes() {
        switch (this.currentSort) {
            case 'time':
                this.filteredRecipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
                break;
            case 'calories':
                this.filteredRecipes.sort((a, b) => a.nutrition?.nutrients?.[0]?.amount - b.nutrition?.nutrients?.[0]?.amount);
                break;
            case 'rating':
                this.filteredRecipes.sort((a, b) => b.spoonacularScore - a.spoonacularScore);
                break;
            case 'relevance':
            default:
                // Keep original order
                break;
        }
        
        this.renderRecipes();
        this.updatePagination();
    }
    
    renderRecipes() {
        this.elements.recipesContainer.innerHTML = '';
        
        // Calculate pagination
        const itemsPerPage = 9;
        const startIndex = (this.currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const recipesToShow = this.filteredRecipes.slice(startIndex, endIndex);
        
        // Create recipe cards
        recipesToShow.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            this.elements.recipesContainer.appendChild(recipeCard);
        });
        
        // Update pagination
        this.totalPages = Math.ceil(this.filteredRecipes.length / itemsPerPage);
        this.updatePagination();
    }
    
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = recipe.id;
        
        // Format data
        const isFavorite = this.favoriteRecipes.has(recipe.id.toString());
        const time = recipe.readyInMinutes || 'N/A';
        const calories = recipe.nutrition?.nutrients?.[0]?.amount?.toFixed(0) || 'N/A';
        const description = recipe.summary 
            ? this.stripHtml(recipe.summary).substring(0, 100) + '...'
            : 'No description available.';
        
        // Get dietary tags
        const dietaryTags = recipe.diets || [];
        
        card.innerHTML = `
            <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${recipe.title}" 
                 class="recipe-image"
                 loading="lazy">
            
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                
                <div class="recipe-meta">
                    <span class="recipe-time">
                        <i class="fas fa-clock"></i> ${time} min
                    </span>
                    <span class="recipe-calories">
                        <i class="fas fa-fire"></i> ${calories} cal
                    </span>
                </div>
                
                <p class="recipe-description">${description}</p>
                
                ${dietaryTags.length > 0 ? `
                    <div class="recipe-dietary">
                        ${dietaryTags.slice(0, 3).map(tag => `
                            <span class="dietary-tag">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="recipe-footer">
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="recipeFinder.toggleFavorite(${recipe.id}, event)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <a href="#" class="view-recipe-btn" onclick="recipeFinder.showRecipeDetails(${recipe.id}, event)">
                        View Recipe <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        // Add click event for card
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.view-recipe-btn')) {
                this.showRecipeDetails(recipe.id);
            }
        });
        
        return card;
    }
    
    renderFeaturedRecipes(recipes) {
        this.elements.featuredContainer.innerHTML = '';
        
        recipes.forEach(recipe => {
            const featuredCard = document.createElement('div');
            featuredCard.className = 'featured-card';
            
            const time = recipe.readyInMinutes || 'N/A';
            const servings = recipe.servings || 'N/A';
            
            featuredCard.innerHTML = `
                <img src="${recipe.image || 'https://via.placeholder.com/300x150?text=No+Image'}" 
                     alt="${recipe.title}" 
                     class="featured-image">
                <div class="featured-content">
                    <h4 class="featured-title">${recipe.title.substring(0, 40)}${recipe.title.length > 40 ? '...' : ''}</h4>
                    <div class="featured-meta">
                        <span><i class="fas fa-clock"></i> ${time} min</span>
                        <span><i class="fas fa-users"></i> ${servings} servings</span>
                    </div>
                </div>
            `;
            
            featuredCard.addEventListener('click', () => this.showRecipeDetails(recipe.id));
            this.elements.featuredContainer.appendChild(featuredCard);
        });
    }
    
    async showRecipeDetails(recipeId, e = null) {
        if (e) e.preventDefault();
        
        this.showLoading();
        
        try {
            let recipe;
            
            if (this.useMockData) {
                // Use mock data for demo
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockRecipes = this.generateMockRecipes();
                recipe = mockRecipes.find(r => r.id === recipeId) || mockRecipes[0];
            } else {
                // Real API call (requires API key)
                const url = `${this.apiBaseUrl}/${recipeId}/information?apiKey=${this.apiKey}&includeNutrition=true`;
                const response = await this.fetchWithTimeout(url);
                recipe = await response.json();
            }
            
            this.createRecipeModal(recipe);
            this.showModal();
        } catch (error) {
            this.handleApiError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    createRecipeModal(recipe) {
        // Format data
        const time = recipe.readyInMinutes || 'N/A';
        const servings = recipe.servings || 'N/A';
        const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount?.toFixed(0) || 'N/A';
        const isFavorite = this.favoriteRecipes.has(recipe.id.toString());
        
        // Get ingredients
        const ingredients = recipe.extendedIngredients?.map(ing => ing.original) || [];
        
        // Get instructions (strip HTML)
        const instructions = recipe.instructions ? this.stripHtml(recipe.instructions) : 'No instructions available.';
        
        // Get nutrition info
        const nutrition = recipe.nutrition?.nutrients?.slice(0, 6) || [];
        
        this.elements.modalBody.innerHTML = `
            <div class="recipe-modal-content">
                <div class="recipe-modal-header">
                    <div class="recipe-modal-image">
                        <img src="${recipe.image || 'https://via.placeholder.com/600x400?text=No+Image'}" 
                             alt="${recipe.title}">
                    </div>
                    <div class="recipe-modal-info">
                        <h2 class="recipe-modal-title">${recipe.title}</h2>
                        
                        <div class="recipe-modal-stats">
                            <div class="stat-item">
                                <i class="fas fa-clock"></i>
                                <div>
                                    <strong>${time}</strong>
                                    <span>Minutes</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-users"></i>
                                <div>
                                    <strong>${servings}</strong>
                                    <span>Servings</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-fire"></i>
                                <div>
                                    <strong>${calories}</strong>
                                    <span>Calories</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                        onclick="recipeFinder.toggleFavorite(${recipe.id}, event)">
                                    <i class="fas fa-heart"></i>
                                    <div>
                                        <strong>${isFavorite ? 'Saved' : 'Save'}</strong>
                                        <span>Favorite</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <div class="recipe-modal-summary">
                            ${recipe.summary ? this.stripHtml(recipe.summary) : 'No summary available.'}
                        </div>
                    </div>
                </div>
                
                <div class="recipe-modal-sections">
                    ${ingredients.length > 0 ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                            <ul class="ingredients-list">
                                ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="modal-section">
                        <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                        <div class="instructions">
                            ${instructions}
                        </div>
                    </div>
                    
                    ${nutrition.length > 0 ? `
                        <div class="modal-section">
                            <h3><i class="fas fa-chart-pie"></i> Nutrition (per serving)</h3>
                            <div class="nutrition-grid">
                                ${nutrition.map(nutrient => `
                                    <div class="nutrition-item">
                                        <strong>${nutrient.name}</strong>
                                        <span>${nutrient.amount.toFixed(1)} ${nutrient.unit}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${recipe.sourceUrl ? `
                        <div class="modal-actions">
                            <a href="${recipe.sourceUrl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i> View Original Recipe
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <style>
                .recipe-modal-content {
                    padding: 20px 0;
                }
                
                .recipe-modal-header {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }
                
                .recipe-modal-image {
                    flex: 0 0 300px;
                }
                
                .recipe-modal-image img {
                    width: 100%;
                    border-radius: var(--border-radius);
                    box-shadow: var(--card-shadow);
                }
                
                .recipe-modal-info {
                    flex: 1;
                    min-width: 300px;
                }
                
                .recipe-modal-title {
                    font-size: 2rem;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }
                
                .recipe-modal-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .recipe-modal-stats .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px;
                    background-color: var(--bg-secondary);
                    border-radius: var(--border-radius-sm);
                    border-left: 4px solid var(--primary-color);
                }
                
                .recipe-modal-stats .stat-item i {
                    font-size: 1.5rem;
                    color: var(--primary-color);
                }
                
                .recipe-modal-stats .stat-item strong {
                    display: block;
                    font-size: 1.3rem;
                    color: var(--text-primary);
                }
                
                .recipe-modal-stats .stat-item span {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                
                .recipe-modal-stats .favorite-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    padding: 0;
                    color: var(--text-secondary);
                }
                
                .recipe-modal-stats .favorite-btn.active {
                    color: var(--danger-color);
                }
                
                .recipe-modal-stats .favorite-btn:hover {
                    opacity: 0.8;
                }
                
                .recipe-modal-summary {
                    line-height: 1.7;
                    color: var(--text-primary);
                    font-size: 1.05rem;
                }
                
                .recipe-modal-sections {
                    margin-bottom: 30px;
                }
                
                .modal-section {
                    margin-bottom: 30px;
                }
                
                .modal-section h3 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    color: var(--text-primary);
                    font-size: 1.4rem;
                }
                
                .modal-section h3 i {
                    color: var(--primary-color);
                }
                
                .ingredients-list {
                    list-style-type: none;
                    padding-left: 20px;
                }
                
                .ingredients-list li {
                    padding: 8px 0;
                    color: var(--text-primary);
                    position: relative;
                    padding-left: 25px;
                }
                
                .ingredients-list li:before {
                    content: "•";
                    color: var(--primary-color);
                    font-size: 1.5rem;
                    position: absolute;
                    left: 0;
                    top: 5px;
                }
                
                .instructions {
                    line-height: 1.7;
                    color: var(--text-primary);
                    white-space: pre-line;
                }
                
                .nutrition-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                
                .nutrition-item {
                    padding: 15px;
                    background-color: var(--bg-secondary);
                    border-radius: var(--border-radius-sm);
                    text-align: center;
                }
                
                .nutrition-item strong {
                    display: block;
                    color: var(--text-primary);
                    margin-bottom: 5px;
                }
                
                .nutrition-item span {
                    color: var(--secondary-color);
                    font-weight: 500;
                }
                
                .modal-actions {
                    margin-top: 30px;
                }
                
                @media (max-width: 768px) {
                    .recipe-modal-header {
                        flex-direction: column;
                    }
                    
                    .recipe-modal-image {
                        flex: 0 0 auto;
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    
                    .nutrition-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 576px) {
                    .recipe-modal-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .nutrition-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }
    
    toggleFavorite(recipeId, e = null) {
        if (e) e.stopPropagation();
        
        const id = recipeId.toString();
        
        if (this.favoriteRecipes.has(id)) {
            this.favoriteRecipes.delete(id);
        } else {
            this.favoriteRecipes.add(id);
        }
        
        // Update UI
        this.updateFavoriteCount();
        this.saveFavorites();
        
        // Update button states
        document.querySelectorAll(`[data-id="${recipeId}"] .favorite-btn`).forEach(btn => {
            btn.classList.toggle('active', this.favoriteRecipes.has(id));
        });
    }
    
    showFavorites() {
        if (this.favoriteRecipes.size === 0) {
            this.showNoResults();
            this.elements.resultsTitle.textContent = 'Favorite Recipes';
            this.elements.resultsCount.textContent = '(0 recipes)';
            return;
        }
        
        // Filter recipes to show only favorites
        this.filteredRecipes = this.recipes.filter(recipe => 
            this.favoriteRecipes.has(recipe.id.toString())
        );
        
        this.elements.resultsTitle.textContent = 'Favorite Recipes';
        this.renderRecipes();
        this.updateResultsCount();
        this.hideFeaturedSection();
    }
    
    updateFavoriteCount() {
        this.elements.favoriteCount.textContent = this.favoriteRecipes.size;
    }
    
    saveFavorites() {
        localStorage.setItem('recipeFavorites', JSON.stringify([...this.favoriteRecipes]));
    }
    
    loadFavorites() {
        const saved = localStorage.getItem('recipeFavorites');
        if (saved) {
            this.favoriteRecipes = new Set(JSON.parse(saved));
            this.updateFavoriteCount();
        }
    }
    
    updateResultsCount() {
        const count = this.filteredRecipes.length;
        this.elements.resultsCount.textContent = `(${count} ${count === 1 ? 'recipe' : 'recipes'})`;
        this.totalResults = count;
    }
    
    updatePagination() {
        this.elements.currentPageSpan.textContent = this.currentPage;
        this.elements.totalPagesSpan.textContent = this.totalPages;
        
        // Update button states
        this.elements.prevPageBtn.disabled = this.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.currentPage >= this.totalPages;
        
        // Update button text
        this.elements.prevPageBtn.innerHTML = this.currentPage <= 1 ? 
            '<i class="fas fa-chevron-left"></i> Previous' : 
            `<i class="fas fa-chevron-left"></i> Page ${this.currentPage - 1}`;
            
        this.elements.nextPageBtn.innerHTML = this.currentPage >= this.totalPages ? 
            'Next <i class="fas fa-chevron-right"></i>' : 
            `Page ${this.currentPage + 1} <i class="fas fa-chevron-right"></i>`;
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderRecipes();
            this.scrollToResults();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderRecipes();
            this.scrollToResults();
        }
    }
    
    setActiveNav(nav) {
        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById(`${nav}Link`).classList.add('active');
    }
    
    showModal() {
        this.elements.recipeModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.elements.recipeModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    showFeaturedSection() {
        this.elements.featuredSection.style.display = 'block';
    }
    
    hideFeaturedSection() {
        this.elements.featuredSection.style.display = 'none';
    }
    
    showLoading() {
        this.isLoading = true;
        this.elements.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.isLoading = false;
        this.elements.loading.style.display = 'none';
    }
    
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorContainer.style.display = 'block';
        this.elements.recipesContainer.style.display = 'none';
    }
    
    hideError() {
        this.elements.errorContainer.style.display = 'none';
        this.elements.recipesContainer.style.display = 'grid';
    }
    
    showNoResults() {
        this.elements.noResults.style.display = 'block';
        this.elements.recipesContainer.style.display = 'none';
        this.hideFeaturedSection();
    }
    
    hideNoResults() {
        this.elements.noResults.style.display = 'none';
        this.elements.recipesContainer.style.display = 'grid';
    }
    
    retryLastAction() {
        if (this.selectedIngredients.length > 0) {
            this.searchRecipes();
        } else {
            this.loadPopularRecipes();
        }
    }
    
    resetSearch() {
        this.selectedIngredients = [];
        this.renderSelectedIngredients();
        this.clearAllFilters();
        this.loadPopularRecipes();
        this.setActiveNav('home');
    }
    
    scrollToResults() {
        document.querySelector('.results-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('recipe-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('recipe-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Utility Methods
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.name === 'AbortError') {
            this.showError('Request timeout. Please try again.');
        } else {
            this.showError('Failed to load recipes. Please check your connection and try again.');
        }
    }
    
    stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }
    
    formatFilterName(filter) {
        const names = {
            'vegetarian': 'Vegetarian',
            'vegan': 'Vegan',
            'gluten-free': 'Gluten Free',
            'dairy-free': 'Dairy Free',
            'keto': 'Keto',
            'low-carb': 'Low Carb',
            'breakfast': 'Breakfast',
            'lunch': 'Lunch',
            'dinner': 'Dinner',
            'snack': 'Snack',
            'dessert': 'Dessert',
            'italian': 'Italian',
            'mexican': 'Mexican',
            'asian': 'Asian',
            'indian': 'Indian',
            'american': 'American',
            'mediterranean': 'Mediterranean'
        };
        
        return names[filter] || filter;
    }
    
    // Mock data generator for demo
    generateMockRecipes() {
        const mockRecipes = [
            {
                id: 1,
                title: "Creamy Chicken Pasta",
                image: "https://spoonacular.com/recipeImages/1-556x370.jpg",
                readyInMinutes: 30,
                servings: 4,
                summary: "A delicious and creamy chicken pasta dish that's perfect for weeknight dinners.",
                diets: ["gluten-free"],
                dishTypes: ["lunch", "dinner"],
                cuisines: ["italian"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 450, unit: "kcal" }
                    ]
                },
                spoonacularScore: 85
            },
            {
                id: 2,
                title: "Vegetable Stir Fry",
                image: "https://spoonacular.com/recipeImages/2-556x370.jpg",
                readyInMinutes: 20,
                servings: 2,
                summary: "Quick and healthy vegetable stir fry with a delicious soy sauce glaze.",
                diets: ["vegetarian", "vegan"],
                dishTypes: ["lunch", "dinner"],
                cuisines: ["asian"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 280, unit: "kcal" }
                    ]
                },
                spoonacularScore: 90
            },
            {
                id: 3,
                title: "Classic Beef Burger",
                image: "https://spoonacular.com/recipeImages/3-556x370.jpg",
                readyInMinutes: 25,
                servings: 4,
                summary: "Juicy beef burgers with all the classic toppings.",
                diets: [],
                dishTypes: ["lunch", "dinner"],
                cuisines: ["american"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 550, unit: "kcal" }
                    ]
                },
                spoonacularScore: 80
            },
            {
                id: 4,
                title: "Greek Salad",
                image: "https://spoonacular.com/recipeImages/4-556x370.jpg",
                readyInMinutes: 15,
                servings: 4,
                summary: "Fresh Greek salad with feta cheese and olive oil dressing.",
                diets: ["vegetarian", "gluten-free"],
                dishTypes: ["lunch", "dinner"],
                cuisines: ["mediterranean"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 220, unit: "kcal" }
                    ]
                },
                spoonacularScore: 88
            },
            {
                id: 5,
                title: "Chocolate Chip Cookies",
                image: "https://spoonacular.com/recipeImages/5-556x370.jpg",
                readyInMinutes: 45,
                servings: 24,
                summary: "Classic homemade chocolate chip cookies.",
                diets: ["vegetarian"],
                dishTypes: ["dessert", "snack"],
                cuisines: ["american"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 150, unit: "kcal" }
                    ]
                },
                spoonacularScore: 92
            },
            {
                id: 6,
                title: "Vegetable Lasagna",
                image: "https://spoonacular.com/recipeImages/6-556x370.jpg",
                readyInMinutes: 60,
                servings: 6,
                summary: "Hearty vegetable lasagna with layers of pasta and cheese.",
                diets: ["vegetarian"],
                dishTypes: ["dinner"],
                cuisines: ["italian"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 380, unit: "kcal" }
                    ]
                },
                spoonacularScore: 87
            },
            {
                id: 7,
                title: "Chicken Tacos",
                image: "https://spoonacular.com/recipeImages/7-556x370.jpg",
                readyInMinutes: 25,
                servings: 4,
                summary: "Flavorful chicken tacos with fresh toppings.",
                diets: ["gluten-free"],
                dishTypes: ["lunch", "dinner"],
                cuisines: ["mexican"],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 320, unit: "kcal" }
                    ]
                },
                spoonacularScore: 84
            },
            {
                id: 8,
                title: "Berry Smoothie Bowl",
                image: "https://spoonacular.com/recipeImages/8-556x370.jpg",
                readyInMinutes: 10,
                servings: 1,
                summary: "Healthy smoothie bowl topped with fresh berries and granola.",
                diets: ["vegetarian", "gluten-free"],
                dishTypes: ["breakfast"],
                cuisines: [],
                nutrition: {
                    nutrients: [
                        { name: "Calories", amount: 280, unit: "kcal" }
                    ]
                },
                spoonacularScore: 89
            }
        ];
        
        return mockRecipes;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.recipeFinder = new RecipeFinder();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in input
        if (e.target.matches('input, textarea')) return;
        
        // Space to focus search
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            document.getElementById('ingredientInput').focus();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && document.getElementById('recipeModal').style.display === 'block') {
            recipeFinder.closeModal();
        }
    });
});