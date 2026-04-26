// QuizManager.js - Manages quiz flow
class QuizManager {
    constructor(stateManager, eventBus, questionManager, timerManager, scoreManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.questionManager = questionManager;
        this.timerManager = timerManager;
        this.scoreManager = scoreManager;
        this.currentQuiz = null;
        this.currentQuestions = [];
        this.currentIndex = 0;
        
        this.init();
    }

    init() {
        document.getElementById('startQuizBtn').onclick = () => this.startQuiz();
        document.getElementById('nextQuestionBtn').onclick = () => this.nextQuestion();
        document.getElementById('prevQuestionBtn').onclick = () => this.prevQuestion();
        document.getElementById('submitQuizBtn').onclick = () => this.submitQuiz();
        document.getElementById('retakeQuizBtn').onclick = () => this.retakeQuiz();
        document.getElementById('newQuizBtn').onclick = () => this.newQuiz();
        document.getElementById('reviewAnswersBtn').onclick = () => this.toggleReview();
    }

    selectQuiz(category) {
        this.currentQuiz = category;
        this.showSetupScreen();
    }

    showSetupScreen() {
        const quizInfo = document.getElementById('quizInfo');
        quizInfo.innerHTML = `
            <h2>${category.name}</h2>
            <p>${category.icon} Test your knowledge in ${category.name}</p>
        `;
        
        this.navigateTo('quizSetup');
    }

    async startQuiz() {
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const difficulty = document.getElementById('difficulty').value;
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        
        this.currentQuestions = await this.questionManager.loadQuestions(
            this.currentQuiz.id, questionCount, difficulty
        );
        
        this.currentIndex = 0;
        this.scoreManager.reset();
        
        if (timeLimit > 0) {
            this.timerManager.startTimer(timeLimit, () => this.timeOut());
        }
        
        this.renderCurrentQuestion();
        this.navigateTo('quiz');
        this.updateProgress();
    }

    renderCurrentQuestion() {
        const question = this.currentQuestions[this.currentIndex];
        const container = document.getElementById('questionContainer');
        
        container.innerHTML = this.questionManager.renderQuestion(question, this.currentIndex);
        
        document.getElementById(`currentQuestion`).textContent = this.currentIndex + 1;
        document.getElementById(`totalQuestions`).textContent = this.currentQuestions.length;
        
        this.questionManager.attachOptionListeners();
        
        // Update navigation buttons
        document.getElementById('prevQuestionBtn').disabled = this.currentIndex === 0;
        
        if (this.currentIndex === this.currentQuestions.length - 1) {
            document.getElementById('nextQuestionBtn').style.display = 'none';
            document.getElementById('submitQuizBtn').style.display = 'flex';
        } else {
            document.getElementById('nextQuestionBtn').style.display = 'flex';
            document.getElementById('submitQuizBtn').style.display = 'none';
        }
        
        this.updateProgress();
    }

    nextQuestion() {
        if (this.currentIndex < this.currentQuestions.length - 1) {
            this.currentIndex++;
            this.renderCurrentQuestion();
        }
    }

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderCurrentQuestion();
        }
    }

    timeOut() {
        this.eventBus.emit('toast', { message: 'Time\'s up! Submitting quiz...', type: 'warning' });
        this.submitQuiz();
    }

    submitQuiz() {
        this.timerManager.stopTimer();
        
        const results = this.scoreManager.calculateResults(this.currentQuestions);
        this.showResults(results);
    }

    showResults(results) {
        this.stateManager.addQuizResult(
            this.currentQuiz.id,
            results.score,
            results.points,
            this.timerManager.getTimeSpent(),
            results.answers
        );
        
        this.renderResults(results);
        this.navigateTo('results');
    }

    renderResults(results) {
        const scorePercent = results.score;
        const correctCount = results.correct;
        const incorrectCount = results.total - results.correct;
        
        document.getElementById('finalScore').textContent = scorePercent;
        document.getElementById('correctCount').textContent = correctCount;
        document.getElementById('incorrectCount').textContent = incorrectCount;
        document.getElementById('pointsEarned').textContent = results.points;
        document.getElementById('timeTaken').textContent = this.formatTime(this.timerManager.getTimeSpent());
        
        // Update score circle
        const circle = document.getElementById('scoreCircle');
        const angle = (scorePercent / 100) * 360;
        circle.style.background = `conic-gradient(var(--primary) ${angle}deg, var(--surface-hover) ${angle}deg)`;
        
        // Render answer review
        const reviewContainer = document.getElementById('answersReview');
        reviewContainer.innerHTML = results.answers.map((answer, index) => `
            <div class="review-item">
                <div class="review-question">${index + 1}. ${answer.question}</div>
                <div class="review-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                    Your answer: ${answer.selectedAnswer}
                    ${!answer.isCorrect ? `<br>Correct answer: ${answer.correctAnswer}` : ''}
                </div>
            </div>
        `).join('');
    }

    retakeQuiz() {
        this.startQuiz();
    }

    newQuiz() {
        this.navigateTo('home');
    }

    toggleReview() {
        const reviewSection = document.getElementById('reviewSection');
        const isHidden = reviewSection.style.display === 'none';
        reviewSection.style.display = isHidden ? 'block' : 'none';
        document.getElementById('reviewAnswersBtn').innerHTML = isHidden ? 
            '<i class="fas fa-times"></i> Hide Review' : 
            '<i class="fas fa-search"></i> Review Answers';
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.currentQuestions.length) * 100;
        document.getElementById('quizProgressBar').style.width = `${progress}%`;
        document.getElementById('currentScore').textContent = this.scoreManager.getCurrentScore();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    navigateTo(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screen}Screen`).classList.add('active');
    }
}

window.QuizManager = QuizManager;