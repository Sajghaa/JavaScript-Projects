// RecipeManager.js - Manages recipe operations
class RecipeManager {
    constructor(stateManager, eventBus, apiManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.apiManager = apiManager;
        this.recipeCard = new RecipeCard(stateManager, eventBus);
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMore = true;
        
        this.init();
    }

    init() {
        this.loadRecipes();
        
        document.getElementById('searchBtn').onclick = () => this.searchRecipes();
        document.getElementById('searchInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.searchRecipes();
        };
        
        document.getElementById('loadMoreBtn').querySelector('button').onclick = () => this.loadMore();
        
        document.getElementById('sortSelect').onchange = () => this.sortRecipes();
    }

    async loadRecipes() {
        this.showLoading(true);
        const recipes = await this.apiManager.getRandomRecipes(12);
        this.stateManager.set('recipes', recipes);
        this.renderRecipes();
        this.showLoading(false);
    }

    async searchRecipes() {
        const query = document.getElementById('searchInput').value;
        if (!query.trim()) {
            this.loadRecipes();
            return;
        }
        
        this.showLoading(true);
        const category = this.stateManager.get('filters.category');
        const diet = this.stateManager.get('filters.diet');
        
        let recipes = await this.apiManager.searchRecipes(query, category, diet);
        this.stateManager.set('recipes', recipes);
        this.renderRecipes();
        this.showLoading(false);
        
        document.getElementById('pageTitle').innerHTML = `Search results for "${query}"`;
    }

    async filterByCategory(category) {
        this.stateManager.set('filters.category', category);
        this.showLoading(true);
        
        let recipes;
        if (category === 'all') {
            recipes = await this.apiManager.getRandomRecipes(12);
        } else {
            recipes = await this.apiManager.getRecipesByCategory(category);
        }
        
        this.stateManager.set('recipes', recipes);
        this.renderRecipes();
        this.showLoading(false);
        
        document.getElementById('pageTitle').innerHTML = category === 'all' ? 'Discover Recipes' : `${category} Recipes`;
    }

    renderRecipes() {
        const container = document.getElementById('recipesGrid');
        const recipes = this.stateManager.get('recipes');
        
        if (!recipes || recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No recipes found</h3>
                    <p>Try a different search term or category</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recipes.map(recipe => this.recipeCard.render(recipe)).join('');
        
        // Attach event listeners
        container.querySelectorAll('.recipe-card').forEach(card => {
            card.onclick = (e) => {
                if (!e.target.closest('.favorite-icon')) {
                    const id = card.dataset.id;
                    this.viewRecipe(id);
                }
            };
        });
        
        container.querySelectorAll('.favorite-icon').forEach(icon => {
            icon.onclick = (e) => {
                e.stopPropagation();
                const id = icon.dataset.id;
                this.toggleFavorite(id);
            };
        });
    }

    sortRecipes() {
        const sortBy = document.getElementById('sortSelect').value;
        let recipes = [...this.stateManager.get('recipes')];
        
        switch(sortBy) {
            case 'rating':
                recipes.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
            case 'time':
                recipes.sort((a, b) => a.time - b.time);
                break;
            case 'name':
                recipes.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default:
                recipes.sort((a, b) => b.id - a.id);
        }
        
        this.stateManager.set('recipes', recipes);
        this.renderRecipes();
    }

    async viewRecipe(id) {
        const recipe = await this.apiManager.getRecipeById(id);
        if (recipe) {
            const modal = new RecipeModal(this.stateManager, this.eventBus);
            modal.show(recipe);
        }
    }

    toggleFavorite(id) {
        const recipes = this.stateManager.get('recipes');
        const recipe = recipes.find(r => r.id === id);
        
        if (this.stateManager.isFavorite(id)) {
            this.stateManager.removeFavorite(id);
            this.eventBus.emit('toast', { message: 'Removed from favorites', type: 'info' });
        } else {
            this.stateManager.addFavorite(recipe);
            this.eventBus.emit('toast', { message: 'Added to favorites', type: 'success' });
        }
        
        this.renderRecipes();
        
        const favoritesCount = this.stateManager.get('favorites').length;
        document.getElementById('favoritesCount').textContent = favoritesCount;
    }

    async loadMore() {
        if (this.isLoading || !this.hasMore) return;
        
        this.isLoading = true;
        const newRecipes = await this.apiManager.getRandomRecipes(6);
        const currentRecipes = this.stateManager.get('recipes');
        const allRecipes = [...currentRecipes, ...newRecipes];
        
        this.stateManager.set('recipes', allRecipes);
        this.renderRecipes();
        this.isLoading = false;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const loadMore = document.getElementById('loadMoreBtn');
        
        if (show) {
            spinner.style.display = 'block';
            loadMore.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            loadMore.style.display = 'block';
        }
    }
}

window.RecipeManager = RecipeManager;