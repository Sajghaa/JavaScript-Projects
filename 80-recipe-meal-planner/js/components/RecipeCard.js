// RecipeCard.js - Renders individual recipe card
class RecipeCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(recipe) {
        const isFavorite = this.stateManager.isFavorite(recipe.id);
        
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-info">
                    <div class="recipe-title">
                        ${recipe.title.length > 40 ? recipe.title.substring(0, 40) + '...' : recipe.title}
                        <i class="fas fa-heart favorite-icon ${isFavorite ? 'active' : ''}" data-id="${recipe.id}" style="color: ${isFavorite ? '#ef4444' : '#9ca3af'}"></i>
                    </div>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.time} min</span>
                        <span><i class="fas fa-star" style="color: #f59e0b;"></i> ${recipe.rating}</span>
                    </div>
                    <div class="recipe-category">${recipe.category}</div>
                </div>
            </div>
        `;
    }
}

window.RecipeCard = RecipeCard;