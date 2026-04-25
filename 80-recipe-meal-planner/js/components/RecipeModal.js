class RecipeModal {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    show(recipe) {
        const modal = document.getElementById('recipeModal');
        const body = document.getElementById('recipeModalBody');
        const title = document.getElementById('modalTitle');
        
        title.textContent = recipe.title;
        
        body.innerHTML = `
            <div class="recipe-details">
                <img src="${recipe.image}" alt="${recipe.title}" class="details-image">
                <div>
                    <div class="details-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.time} minutes</span>
                        <span><i class="fas fa-star" style="color: #f59e0b;"></i> ${recipe.rating}</span>
                        <span><i class="fas fa-tag"></i> ${recipe.category}</span>
                        ${recipe.area ? `<span><i class="fas fa-globe"></i> ${recipe.area}</span>` : ''}
                    </div>
                    
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li>
                                <i class="fas fa-check-circle"></i>
                                ${ing.original}
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button id="addToShoppingListBtn" class="btn btn-secondary">
                            <i class="fas fa-shopping-basket"></i> Add to Shopping List
                        </button>
                        <button id="addToMealPlanBtn" class="btn btn-primary">
                            <i class="fas fa-calendar-plus"></i> Add to Meal Plan
                        </button>
                    </div>
                </div>
            </div>
            <div style="margin-top: 1.5rem;">
                <h3>Instructions</h3>
                <div class="instructions">${recipe.instructions || 'Instructions not available.'}</div>
            </div>
            ${recipe.youtube ? `
                <div style="margin-top: 1rem;">
                    <a href="${recipe.youtube}" target="_blank" class="btn btn-primary">
                        <i class="fab fa-youtube"></i> Watch on YouTube
                    </a>
                </div>
            ` : ''}
        `;
        
        modal.classList.add('active');
        
        document.getElementById('addToShoppingListBtn').onclick = () => {
            this.eventBus.emit('shopping:add', recipe);
            this.eventBus.emit('toast', { message: 'Added to shopping list', type: 'success' });
        };
        
        document.getElementById('addToMealPlanBtn').onclick = () => {
            this.eventBus.emit('mealplan:show', recipe);
        };
    }
}

window.RecipeModal = RecipeModal;