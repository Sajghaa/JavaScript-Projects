// QuizManager.js - Manages quiz flow (FIXED)
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
        console.log('Quiz selected:', category);
        this.currentQuiz = category;
        this.showSetupScreen();
    }

    showSetupScreen() {
        const quizInfo = document.getElementById('quizInfo');
        if (!quizInfo) {
            console.error('quizInfo element not found');
            return;
        }
        
        quizInfo.innerHTML = `
            <h2>${this.currentQuiz.name}</h2>
            <p>${this.currentQuiz.icon} Test your knowledge in ${this.currentQuiz.name}</p>
        `;
        
        // Reset form values to defaults
        document.getElementById('questionCount').value = '10';
        document.getElementById('difficulty').value = 'medium';
        document.getElementById('timeLimit').value = '30';
        
        // Navigate to setup screen
        this.navigateTo('quizSetup');
    }

    async startQuiz() {
        console.log('Starting quiz...');
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const difficulty = document.getElementById('difficulty').value;
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        
        // Show loading state
        this.showLoading(true);
        
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
        this.showLoading(false);
    }

    renderCurrentQuestion() {
        const question = this.currentQuestions[this.currentIndex];
        const container = document.getElementById('questionContainer');
        
        if (!container) {
            console.error('questionContainer not found');
            return;
        }
        
        // Use QuestionCard component to render
        const questionCard = window.app?.questionCard;
        if (questionCard) {
            container.innerHTML = questionCard.render(question, this.currentIndex, question.userAnswer);
            questionCard.attachEvents(container, question.id, (qId, selectedIndex) => {
                const q = this.currentQuestions.find(q => q.id === qId);
                if (q) {
                    q.userAnswer = selectedIndex;
                    this.scoreManager.updateScore(q);
                    this.updateProgress();
                }
            });
        } else {
            // Fallback rendering
            container.innerHTML = this.renderQuestionFallback(question);
            this.attachFallbackListeners();
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        
        if (this.currentIndex === this.currentQuestions.length - 1) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'flex';
        } else {
            if (nextBtn) nextBtn.style.display = 'flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }
        
        document.getElementById('currentQuestion').textContent = this.currentIndex + 1;
        document.getElementById('totalQuestions').textContent = this.currentQuestions.length;
    }

    renderQuestionFallback(question) {
        const letters = ['A', 'B', 'C', 'D'];
        return `
            <div class="question-text">${this.currentIndex + 1}. ${question.text}</div>
            <div class="options-list">
                ${question.options.map((option, idx) => `
                    <div class="option-item ${question.userAnswer === idx ? 'selected' : ''}" data-option-index="${idx}">
                        <div class="option-letter">${letters[idx]}</div>
                        <div class="option-text">${option}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachFallbackListeners() {
        document.querySelectorAll('.option-item').forEach(option => {
            option.onclick = () => {
                const optionIndex = parseInt(option.dataset.optionIndex);
                const currentQuestion = this.currentQuestions[this.currentIndex];
                
                // Remove selected class from all options
                option.parentElement.querySelectorAll('.option-item').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                option.classList.add('selected');
                currentQuestion.userAnswer = optionIndex;
                this.scoreManager.updateScore(currentQuestion);
                this.updateProgress();
            };
        });
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
        
        // Use ResultCard component to render
        const resultCard = window.app?.resultCard;
        const resultsContainer = document.getElementById('resultsScreen');
        
        if (resultCard && resultsContainer) {
            const resultsHTML = resultCard.render(results);
            const existingContainer = resultsContainer.querySelector('.results-container');
            if (existingContainer) {
                existingContainer.innerHTML = resultsHTML;
            } else {
                resultsContainer.innerHTML = `<div class="results-container">${resultsHTML}</div>`;
            }
        }
        
        this.navigateTo('results');
    }

    retakeQuiz() {
        this.startQuiz();
    }

    newQuiz() {
        this.navigateTo('home');
    }

    toggleReview() {
        const reviewSection = document.getElementById('reviewSection');
        if (reviewSection) {
            const isHidden = reviewSection.style.display === 'none';
            reviewSection.style.display = isHidden ? 'block' : 'none';
            const reviewBtn = document.getElementById('reviewAnswersBtn');
            if (reviewBtn) {
                reviewBtn.innerHTML = isHidden ? 
                    '<i class="fas fa-times"></i> Hide Review' : 
                    '<i class="fas fa-search"></i> Review Answers';
            }
        }
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.currentQuestions.length) * 100;
        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) progressBar.style.width = `${progress}%`;
        
        const currentScoreSpan = document.getElementById('currentScore');
        if (currentScoreSpan) currentScoreSpan.textContent = this.scoreManager.getCurrentScore();
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    navigateTo(screen) {
        console.log('Navigating to:', screen);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById(`${screen}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        } else {
            console.error(`Screen ${screen}Screen not found`);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

window.QuizManager = QuizManager;