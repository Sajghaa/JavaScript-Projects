// CategoryManager.js - Manages categories
class CategoryManager {
    constructor(stateManager, eventBus, quizManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.quizManager = quizManager;
        
        this.renderCategories();
    }

    renderCategories() {
        const container = document.getElementById('categoriesGrid');
        const categories = this.stateManager.get('categories');
        
        container.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-title">${category.name}</div>
                <div class="category-stats">
                    <span><i class="fas fa-question-circle"></i> ${category.quizCount} quizzes</span>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.category-card').forEach(card => {
            card.onclick = () => {
                const categoryId = card.dataset.category;
                const category = categories.find(c => c.id === categoryId);
                this.quizManager.selectQuiz(category);
            };
        });
    }
}

window.CategoryManager = CategoryManager;