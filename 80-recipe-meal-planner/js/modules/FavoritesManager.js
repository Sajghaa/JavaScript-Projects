// FavoritesManager.js - Manages favorites
class FavoritesManager {
    constructor(stateManager, eventBus, recipeManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.recipeManager = recipeManager;
        
        this.init();
    }

    init() {
        document.getElementById('favoritesBtn').onclick = () => this.showPanel();
    }

    showPanel() {
        const panel = document.getElementById('favoritesPanel');
        panel.classList.add('open');
        this.renderFavorites();
    }

    closePanel() {
        document.getElementById('favoritesPanel').classList.remove('open');
    }

    renderFavorites() {
        const container = document.getElementById('favoritesList');
        const favorites = this.stateManager.get('favorites');
        
        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>Click the heart icon on any recipe to save it here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = favorites.map(recipe => `
            <div class="favorite-item" data-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.title}" class="favorite-image">
                <div class="favorite-info">
                    <div class="favorite-title">${recipe.title}</div>
                    <div class="favorite-category">${recipe.category} • ${recipe.time} min</div>
                </div>
                <button class="remove-favorite" data-id="${recipe.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        container.querySelectorAll('.favorite-item').forEach(item => {
            item.onclick = (e) => {
                if (!e.target.closest('.remove-favorite')) {
                    const id = item.dataset.id;
                    this.recipeManager.viewRecipe(id);
                }
            };
        });
        
        container.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.stateManager.removeFavorite(id);
                this.renderFavorites();
                document.getElementById('favoritesCount').textContent = this.stateManager.get('favorites').length;
                this.eventBus.emit('toast', { message: 'Removed from favorites', type: 'info' });
            };
        });
    }
}

window.FavoritesManager = FavoritesManager;