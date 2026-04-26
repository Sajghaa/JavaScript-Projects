class QuestionCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.letters = ['A', 'B', 'C', 'D'];
    }

    render(question, index, selectedAnswer = null) {
        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="question-points">${this.getPoints(question.difficulty)} pts</span>
                </div>
                <div class="question-text">${question.text}</div>
                <div class="options-grid">
                    ${question.options.map((option, optIndex) => `
                        <div class="option-item ${selectedAnswer === optIndex ? 'selected' : ''} 
                                   ${this.getOptionClass(question, optIndex)}" 
                             data-option-index="${optIndex}">
                            <div class="option-letter">${this.letters[optIndex]}</div>
                            <div class="option-text">${option}</div>
                            ${this.renderOptionIcon(question, optIndex)}
                        </div>
                    `).join('')}
                </div>
                ${question.explanation ? `
                    <div class="question-explanation">
                        <i class="fas fa-lightbulb"></i>
                        <span>${question.explanation}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getPoints(difficulty) {
        const points = { easy: 5, medium: 10, hard: 15 };
        return points[difficulty] || 10;
    }

    getOptionClass(question, optIndex) {
        if (question.showAnswer) {
            if (optIndex === question.correctIndex) return 'correct';
            if (question.userAnswer === optIndex && optIndex !== question.correctIndex) return 'incorrect';
        }
        return '';
    }

    renderOptionIcon(question, optIndex) {
        if (question.showAnswer) {
            if (optIndex === question.correctIndex) {
                return '<i class="fas fa-check-circle correct-icon"></i>';
            }
            if (question.userAnswer === optIndex && optIndex !== question.correctIndex) {
                return '<i class="fas fa-times-circle incorrect-icon"></i>';
            }
        }
        return '';
    }

    attachEvents(element, questionId, onSelect) {
        const options = element.querySelectorAll('.option-item');
        options.forEach(option => {
            option.onclick = (e) => {
                e.stopPropagation();
                const selectedIndex = parseInt(option.dataset.optionIndex);
                onSelect(questionId, selectedIndex);
            };
        });
    }

    renderSkeleton() {
        return `
            <div class="question-card skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-options">
                    <div class="skeleton-option"></div>
                    <div class="skeleton-option"></div>
                    <div class="skeleton-option"></div>
                    <div class="skeleton-option"></div>
                </div>
            </div>
        `;
    }
}

window.QuestionCard = QuestionCard;