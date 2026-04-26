class ScoreManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentScore = 0;
        this.answers = [];
    }

    reset() {
        this.currentScore = 0;
        this.answers = [];
    }

    updateScore(question) {
        const isCorrect = question.userAnswer === question.correctIndex;
        const points = isCorrect ? 10 : 0;
        
        const existingIndex = this.answers.findIndex(a => a.questionId === question.id);
        
        if (existingIndex !== -1) {
            // Update existing answer
            const oldPoints = this.answers[existingIndex].points;
            this.currentScore += points - oldPoints;
            this.answers[existingIndex] = {
                questionId: question.id,
                question: question.text,
                selectedAnswer: question.options[question.userAnswer],
                correctAnswer: question.options[question.correctIndex],
                isCorrect,
                points
            };
        } else {
            // Add new answer
            this.currentScore += points;
            this.answers.push({
                questionId: question.id,
                question: question.text,
                selectedAnswer: question.options[question.userAnswer],
                correctAnswer: question.options[question.correctIndex],
                isCorrect,
                points
            });
        }
        
        this.eventBus.emit('score:updated', this.currentScore);
    }

    calculateResults(questions) {
        const totalQuestions = questions.length;
        const totalPossibleScore = totalQuestions * 10;
        const correctAnswers = this.answers.filter(a => a.isCorrect).length;
        const score = Math.round((this.currentScore / totalPossibleScore) * 100);
        
        return {
            score,
            points: this.currentScore,
            correct: correctAnswers,
            total: totalQuestions,
            answers: this.answers
        };
    }

    getCurrentScore() {
        return this.currentScore;
    }
}

window.ScoreManager = ScoreManager;