class CategoryFilter {
    constructor(stateManager, eventBus, recipeManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.recipeManager = recipeManager;
        
        this.init();
    }

    init() {
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.onclick = () => {
                const category = chip.dataset.category;
                this.selectCategory(category);
            };
        });
        
        document.querySelectorAll('.diet-chip').forEach(chip => {
            chip.onclick = () => {
                const diet = chip.dataset.diet;
                this.selectDiet(diet);
            };
        });
    }

    selectCategory(category) {
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === category);
        });
        
        this.recipeManager.filterByCategory(category);
    }

    selectDiet(diet) {
        document.querySelectorAll('.diet-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.diet === diet);
        });
        
        this.stateManager.set('filters.diet', diet);
        this.recipeManager.searchRecipes();
    }
}

window.CategoryFilter = CategoryFilter;