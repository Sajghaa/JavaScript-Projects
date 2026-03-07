export class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.elements = this.cacheElements();
        this.recipeCards = new Map();
        this.initEventListeners();
        this.initSubscriptions();
    }

    // Cache DOM elements
    cacheElements() {
        return {
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            themeToggle: document.getElementById('themeToggle'),
            recipesGrid: document.getElementById('recipesGrid'),
            favoritesGrid: document.getElementById('favoritesGrid'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            noResults: document.getElementById('noResults'),
            noFavorites: document.getElementById('noFavorites'),
            resultsCount: document.getElementById('resultsCount'),
            favoritesCount: document.getElementById('favoritesCount'),
            loadMoreBtn: document.getElementById('loadMoreBtn'),
            mealType: document.getElementById('mealType'),
            dietType: document.getElementById('dietType'),
            cuisineType: document.getElementById('cuisineType'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            searchResults: document.getElementById('searchResults'),
            favoritesSection: document.getElementById('favoritesSection'),
            modal: document.getElementById('recipeModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            closeModal: document.querySelector('.close-modal'),
            toast: document.getElementById('toast')
        };
    }

    // Initialize event listeners
    initEventListeners() {
        // Search
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Filters
        this.elements.mealType.addEventListener('change', () => this.handleFilterChange());
        this.elements.dietType.addEventListener('change', () => this.handleFilterChange());
        this.elements.cuisineType.addEventListener('change', () => this.handleFilterChange());

        // Tabs
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Load more
        this.elements.loadMoreBtn.addEventListener('click', () => this.handleLoadMore());

        // Modal
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });
    }

    // Initialize state subscriptions
    initSubscriptions() {
        // Subscribe to recipes changes
        this.stateManager.subscribe('recipes', (recipes) => {
            this.renderSearchResults(recipes);
            this.updateResultsCount(recipes.length);
        });

        // Subscribe to favorites changes
        this.stateManager.subscribe('favorites', (favorites) => {
            this.renderFavorites(favorites);
            this.updateFavoritesCount(favorites.length);
        });

        // Subscribe to loading state
        this.stateManager.subscribe('loading', (loading) => {
            this.toggleLoading(loading);
        });

        // Subscribe to error state
        this.stateManager.subscribe('error', (error) => {
            if (error) this.showToast(error, 'error');
        });
    }

    // Handle search
    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        if (query) {
            this.stateManager.set('currentSearch', query);
            // Trigger search through event
            document.dispatchEvent(new CustomEvent('recipeSearch', { 
                detail: { query, filters: this.getFilters() }
            }));
        }
    }

    // Get current filters
    getFilters() {
        return {
            mealType: this.elements.mealType.value,
            dietType: this.elements.dietType.value,
            cuisineType: this.elements.cuisineType.value
        };
    }

    // Handle filter change
    handleFilterChange() {
        const currentSearch = this.stateManager.get('currentSearch');
        if (currentSearch) {
            this.handleSearch();
        }
    }

    // Handle load more
    handleLoadMore() {
        document.dispatchEvent(new CustomEvent('loadMoreRecipes'));
    }

    // Switch between tabs
    switchTab(tabId) {
        // Update tab buttons
        this.elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update sections
        this.elements.searchResults.classList.toggle('active', tabId === 'search');
        this.elements.favoritesSection.classList.toggle('active', tabId === 'favorites');

        // Refresh favorites if switching to favorites tab
        if (tabId === 'favorites') {
            this.renderFavorites(this.stateManager.get('favorites'));
        }
    }

    // Render search results
    renderSearchResults(recipes) {
        const grid = this.elements.recipesGrid;
        grid.innerHTML = '';

        if (recipes.length === 0) {
            this.elements.noResults.classList.remove('hidden');
            this.elements.loadMoreBtn.classList.add('hidden');
            return;
        }

        this.elements.noResults.classList.add('hidden');
        
        recipes.forEach(recipe => {
            const card = new RecipeCard(
                recipe, 
                this.stateManager, 
                () => this.showToast(recipe.strMeal, 'success'),
                (recipe) => this.showRecipeDetails(recipe)
            );
            grid.appendChild(card.create());
        });

        // Show/hide load more button
        const hasMore = this.stateManager.get('hasMore');
        this.elements.loadMoreBtn.classList.toggle('hidden', !hasMore);
    }

    // Render favorites
    renderFavorites(favorites) {
        const grid = this.elements.favoritesGrid;
        grid.innerHTML = '';

        if (favorites.length === 0) {
            this.elements.noFavorites.classList.remove('hidden');
            return;
        }

        this.elements.noFavorites.classList.add('hidden');
        
        favorites.forEach(recipe => {
            const card = new RecipeCard(
                recipe, 
                this.stateManager, 
                () => this.showToast('Favorite updated', 'success'),
                (recipe) => this.showRecipeDetails(recipe)
            );
            grid.appendChild(card.create());
        });
    }

    // Show recipe details in modal
    async showRecipeDetails(recipe) {
        this.elements.modalTitle.textContent = recipe.strMeal;
        
        // Parse ingredients
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({ ingredient, measure });
            }
        }

        this.elements.modalBody.innerHTML = `
            <div class="recipe-details">
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                
                <div class="section">
                    <h3><i class="fas fa-info-circle"></i> Details</h3>
                    <p><strong>Category:</strong> ${recipe.strCategory || 'N/A'}</p>
                    <p><strong>Cuisine:</strong> ${recipe.strArea || 'N/A'}</p>
                    ${recipe.strTags ? `<p><strong>Tags:</strong> ${recipe.strTags}</p>` : ''}
                </div>
                
                <div class="section">
                    <h3><i class="fas fa-list"></i> Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map(item => `
                            <li>
                                <span class="ingredient">${item.ingredient}</span>
                                <span class="measure">${item.measure}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="section">
                    <h3><i class="fas fa-book-open"></i> Instructions</h3>
                    <div class="instructions">
                        ${recipe.strInstructions ? recipe.strInstructions.replace(/\n/g, '<br>') : 'No instructions available.'}
                    </div>
                </div>
                
                ${recipe.strYoutube ? `
                    <div class="section">
                        <h3><i class="fab fa-youtube"></i> Video Tutorial</h3>
                        <a href="${recipe.strYoutube}" target="_blank" class="btn btn-primary">
                            Watch on YouTube
                        </a>
                    </div>
                ` : ''}
                
                ${recipe.strSource ? `
                    <div class="section">
                        <h3><i class="fas fa-link"></i> Source</h3>
                        <a href="${recipe.strSource}" target="_blank" class="btn btn-secondary">
                            View Original Recipe
                        </a>
                    </div>
                ` : ''}
            </div>
        `;

        this.elements.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    closeModal() {
        this.elements.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Toggle loading spinner
    toggleLoading(show) {
        this.elements.loadingSpinner.classList.toggle('hidden', !show);
        this.elements.recipesGrid.classList.toggle('hidden', show);
    }

    // Update results count
    updateResultsCount(count) {
        this.elements.resultsCount.textContent = count;
    }

    // Update favorites count
    updateFavoritesCount(count) {
        this.elements.favoritesCount.textContent = count;
    }

    // Show toast notification
    showToast(message, type = 'success') {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('hidden', 'error', 'success');
        this.elements.toast.classList.add(type);
        
        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 3000);
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.elements.themeToggle.innerHTML = newTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem('theme', newTheme);
    }

    // Load saved theme
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.elements.themeToggle.innerHTML = savedTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}