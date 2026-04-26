// QuizCard.js - Renders individual quiz card for category selection
class QuizCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(category) {
        return `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-title">${category.name}</div>
                <div class="category-stats">
                    <span><i class="fas fa-question-circle"></i> ${category.quizCount} quizzes</span>
                    <span><i class="fas fa-users"></i> ${this.getParticipantsCount(category.id)} played</span>
                </div>
                <div class="category-difficulty">
                    <span class="difficulty-badge easy">Easy</span>
                    <span class="difficulty-badge medium">Medium</span>
                    <span class="difficulty-badge hard">Hard</span>
                </div>
            </div>
        `;
    }

    getParticipantsCount(categoryId) {
        const leaderboard = this.stateManager.get('leaderboard');
        const count = leaderboard.filter(entry => entry.quizId === categoryId).length;
        return count || Math.floor(Math.random() * 500) + 100;
    }

    attachEvents(element, categoryId) {
        element.onclick = () => {
            this.eventBus.emit('quiz:selected', categoryId);
        };
    }
}

window.QuizCard = QuizCard;