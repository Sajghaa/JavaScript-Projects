export class RecipeCard {
    constructor(recipe, stateManager, onFavoriteToggle, onClick) {
        this.recipe = recipe;
        this.stateManager = stateManager;
        this.onFavoriteToggle = onFavoriteToggle;
        this.onClick = onClick;
        this.element = null;
    }

    // Create card element
    create() {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = this.recipe.idMeal;

        // Check if favorite
        const isFavorite = this.stateManager.isFavorite(this.recipe.idMeal);

        // Extract tags
        const tags = this.recipe.strTags ? this.recipe.strTags.split(',') : [];
        const category = this.recipe.strCategory || '';
        const area = this.recipe.strArea || '';

        card.innerHTML = `
            <div class="recipe-image-container">
                <img 
                    src="${this.recipe.strMealThumb || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                    alt="${this.recipe.strMeal}"
                    class="recipe-image"
                    loading="lazy"
                >
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${this.recipe.idMeal}">
                    <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart'}"></i>
                </button>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${this.recipe.strMeal}</h3>
                <div class="recipe-meta">
                    ${category ? `<span><i class="fas fa-utensils"></i> ${category}</span>` : ''}
                    ${area ? `<span><i class="fas fa-globe"></i> ${area}</span>` : ''}
                </div>
                <div class="recipe-tags">
                    ${tags.slice(0, 3).map(tag => 
                        `<span class="tag">${tag.trim()}</span>`
                    ).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const favoriteBtn = card.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleFavoriteToggle();
        });

        card.addEventListener('click', () => {
            if (this.onClick) {
                this.onClick(this.recipe);
            }
        });

        this.element = card;
        return card;
    }

    // Handle favorite toggle
    handleFavoriteToggle() {
        const isFavorite = this.stateManager.isFavorite(this.recipe.idMeal);
        
        if (isFavorite) {
            this.stateManager.removeFavorite(this.recipe.idMeal);
        } else {
            this.stateManager.addFavorite(this.recipe);
        }
        
        // Update button UI
        const btn = this.element.querySelector('.favorite-btn');
        btn.classList.toggle('active');
        
        // Call callback
        if (this.onFavoriteToggle) {
            this.onFavoriteToggle(this.recipe, !isFavorite);
        }
    }

    // Update recipe data
    update(recipe) {
        this.recipe = recipe;
        const newElement = this.create();
        this.element.replaceWith(newElement);
        this.element = newElement;
    }

    // Remove card
    remove() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}