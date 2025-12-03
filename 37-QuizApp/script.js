class QuizApp {
    constructor() {
        // App State
        this.currentUser = 'Guest';
        this.userStats = {
            totalScore: 0,
            quizzesTaken: 0,
            totalQuestions: 0,
            correctAnswers: 0
        };
        this.quizScores = [];
        this.categories = [];
        this.questions = [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.selectedAnswer = null;
        this.quizStarted = false;
        this.quizPaused = false;
        
        // DOM Elements
        this.elements = {
            // Navigation
            homeLink: document.getElementById('homeLink'),
            quizLink: document.getElementById('quizLink'),
            scoresLink: document.getElementById('scoresLink'),
            categoriesLink: document.getElementById('categoriesLink'),
            scoresCount: document.querySelector('.scores-count'),
            
            // User Info
            userName: document.getElementById('userName'),
            displayUserName: document.getElementById('displayUserName'),
            userInfo: document.getElementById('userInfo'),
            userScore: document.getElementById('userScore'),
            quizzesTaken: document.getElementById('quizzesTaken'),
            accuracyRate: document.getElementById('accuracyRate'),
            userRank: document.getElementById('userRank'),
            
            // Hero Stats
            totalQuestions: document.getElementById('totalQuestions'),
            totalCategories: document.getElementById('totalCategories'),
            totalPlayers: document.getElementById('totalPlayers'),
            
            // Sections
            homeSection: document.getElementById('homeSection'),
            quizSection: document.getElementById('quizSection'),
            scoresSection: document.getElementById('scoresSection'),
            categoriesSection: document.getElementById('categoriesSection'),
            
            // Home Section
            categoriesGrid: document.querySelector('.categories-grid'),
            recentScoresSection: document.getElementById('recentScoresSection'),
            scoresTableBody: document.getElementById('scoresTableBody'),
            clearScoresBtn: document.getElementById('clearScoresBtn'),
            changeNameBtn: document.getElementById('changeNameBtn'),
            startQuizBtn: document.getElementById('startQuizBtn'),
            selectCategoryBtn: document.getElementById('selectCategoryBtn'),
            
            // Quiz Section
            quizCategoryBadge: document.getElementById('quizCategoryBadge'),
            quizTitle: document.getElementById('quizTitle'),
            currentQuestionNumber: document.getElementById('currentQuestionNumber'),
            totalQuestionsCount: document.getElementById('totalQuestionsCount'),
            quizTimer: document.getElementById('quizTimer'),
            currentScore: document.getElementById('currentScore'),
            progressBar: document.getElementById('progressBar'),
            progressPercent: document.getElementById('progressPercent'),
            questionNumber: document.getElementById('questionNumber'),
            questionDifficulty: document.getElementById('questionDifficulty'),
            questionText: document.getElementById('questionText'),
            questionImageContainer: document.getElementById('questionImageContainer'),
            questionImage: document.getElementById('questionImage'),
            answersContainer: document.getElementById('answersContainer'),
            questionHint: document.getElementById('questionHint'),
            hintText: document.getElementById('hintText'),
            hintBtn: document.getElementById('hintBtn'),
            skipBtn: document.getElementById('skipBtn'),
            nextBtn: document.getElementById('nextBtn'),
            quizFeedback: document.getElementById('quizFeedback'),
            feedbackIcon: document.getElementById('feedbackIcon'),
            feedbackTitle: document.getElementById('feedbackTitle'),
            feedbackMessage: document.getElementById('feedbackMessage'),
            
            // Quiz Sidebar
            sidebarCategory: document.getElementById('sidebarCategory'),
            sidebarDifficulty: document.getElementById('sidebarDifficulty'),
            sidebarQuestionCount: document.getElementById('sidebarQuestionCount'),
            sidebarTimeLimit: document.getElementById('sidebarTimeLimit'),
            questionList: document.getElementById('questionList'),
            pauseQuizBtn: document.getElementById('pauseQuizBtn'),
            endQuizBtn: document.getElementById('endQuizBtn'),
            
            // Scores Section
            scoreCategoryFilter: document.getElementById('scoreCategoryFilter'),
            scoreTimeFilter: document.getElementById('scoreTimeFilter'),
            totalScoreDisplay: document.getElementById('totalScoreDisplay'),
            averageScoreDisplay: document.getElementById('averageScoreDisplay'),
            bestScoreDisplay: document.getElementById('bestScoreDisplay'),
            totalTimeDisplay: document.getElementById('totalTimeDisplay'),
            chartTypeSelect: document.getElementById('chartTypeSelect'),
            detailedScoresContainer: document.getElementById('detailedScoresContainer'),
            
            // Categories Section
            categoriesList: document.getElementById('categoriesList'),
            
            // Modals
            resultsModal: document.getElementById('resultsModal'),
            finalScore: document.getElementById('finalScore'),
            correctAnswers: document.getElementById('correctAnswers'),
            accuracyResult: document.getElementById('accuracyResult'),
            timeTaken: document.getElementById('timeTaken'),
            questionReviewContainer: document.getElementById('questionReviewContainer'),
            retryQuizBtn: document.getElementById('retryQuizBtn'),
            newQuizBtn: document.getElementById('newQuizBtn'),
            shareResultsBtn: document.getElementById('shareResultsBtn'),
            
            nameModal: document.getElementById('nameModal'),
            newUserName: document.getElementById('newUserName'),
            cancelNameBtn: document.getElementById('cancelNameBtn'),
            saveNameBtn: document.getElementById('saveNameBtn'),
            
            categoryModal: document.getElementById('categoryModal'),
            categoryOptions: document.getElementById('categoryOptions'),
            questionCount: document.getElementById('questionCount'),
            difficultyLevel: document.getElementById('difficultyLevel'),
            timeLimit: document.getElementById('timeLimit'),
            cancelCategoryBtn: document.getElementById('cancelCategoryBtn'),
            startCategoryQuizBtn: document.getElementById('startCategoryQuizBtn'),
            
            pauseModal: document.getElementById('pauseModal'),
            pauseScore: document.getElementById('pauseScore'),
            pauseQuestions: document.getElementById('pauseQuestions'),
            pauseTime: document.getElementById('pauseTime'),
            resumeQuizBtn: document.getElementById('resumeQuizBtn'),
            quitQuizBtn: document.getElementById('quitQuizBtn'),
            
            // Theme Toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // Footer
            resetProgressBtn: document.getElementById('resetProgressBtn'),
            backToTop: document.getElementById('backToTop'),
            
            // Confetti
            confettiCanvas: document.getElementById('confettiCanvas')
        };
        
        // Chart instance
        this.scoresChart = null;
        this.performanceChart = null;
        
        // Initialize the app
        this.init();
    }
    
    init() {
        this.setupCategories();
        this.loadUserData();
        this.loadQuizScores();
        this.setupEventListeners();
        this.setupTheme();
        this.renderHomePage();
        this.updateUserDisplay();
    }
    
    setupCategories() {
        this.categories = [
            {
                id: 'general',
                name: 'General Knowledge',
                icon: 'fas fa-globe',
                description: 'Test your knowledge about the world around you',
                questionCount: 25,
                color: '#7c3aed'
            },
            {
                id: 'science',
                name: 'Science & Technology',
                icon: 'fas fa-flask',
                description: 'Explore the world of science and technology',
                questionCount: 30,
                color: '#10b981'
            },
            {
                id: 'history',
                name: 'History',
                icon: 'fas fa-landmark',
                description: 'Journey through historical events and figures',
                questionCount: 20,
                color: '#f59e0b'
            },
            {
                id: 'geography',
                name: 'Geography',
                icon: 'fas fa-map',
                description: 'Test your knowledge of countries, capitals, and landmarks',
                questionCount: 22,
                color: '#3b82f6'
            },
            {
                id: 'movies',
                name: 'Movies & TV',
                icon: 'fas fa-film',
                description: 'Questions about films, television shows, and celebrities',
                questionCount: 18,
                color: '#ef4444'
            },
            {
                id: 'sports',
                name: 'Sports',
                icon: 'fas fa-football-ball',
                description: 'Test your sports knowledge across various disciplines',
                questionCount: 15,
                color: '#8b5cf6'
            }
        ];
        
        // Update total categories count
        this.elements.totalCategories.textContent = this.categories.length;
    }
    
    setupEventListeners() {
        // Navigation
        this.elements.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showHomeSection();
        });
        
        this.elements.quizLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showQuizSection();
        });
        
        this.elements.scoresLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showScoresSection();
        });
        
        this.elements.categoriesLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCategoriesSection();
        });
        
        // Home Actions
        this.elements.changeNameBtn.addEventListener('click', () => this.showNameModal());
        this.elements.startQuizBtn.addEventListener('click', () => this.startRandomQuiz());
        this.elements.selectCategoryBtn.addEventListener('click', () => this.showCategoryModal());
        this.elements.clearScoresBtn.addEventListener('click', () => this.clearScores());
        
        // Quiz Actions
        this.elements.hintBtn.addEventListener('click', () => this.showHint());
        this.elements.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.pauseQuizBtn.addEventListener('click', () => this.pauseQuiz());
        this.elements.endQuizBtn.addEventListener('click', () => this.endQuiz());
        
        // Modal Actions
        this.elements.cancelNameBtn.addEventListener('click', () => this.closeModal(this.elements.nameModal));
        this.elements.saveNameBtn.addEventListener('click', () => this.saveUserName());
        this.elements.newUserName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUserName();
        });
        
        this.elements.cancelCategoryBtn.addEventListener('click', () => this.closeModal(this.elements.categoryModal));
        this.elements.startCategoryQuizBtn.addEventListener('click', () => this.startCategoryQuiz());
        
        this.elements.resumeQuizBtn.addEventListener('click', () => this.resumeQuiz());
        this.elements.quitQuizBtn.addEventListener('click', () => this.quitQuiz());
        
        this.elements.retryQuizBtn.addEventListener('click', () => this.retryQuiz());
        this.elements.newQuizBtn.addEventListener('click', () => this.startNewQuiz());
        this.elements.shareResultsBtn.addEventListener('click', () => this.shareResults());
        
        // Score Filters
        this.elements.scoreCategoryFilter.addEventListener('change', () => this.updateScoresDisplay());
        this.elements.scoreTimeFilter.addEventListener('change', () => this.updateScoresDisplay());
        this.elements.chartTypeSelect.addEventListener('change', () => this.updateScoresChart());
        
        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Footer Actions
        this.elements.resetProgressBtn.addEventListener('click', () => this.resetProgress());
        this.elements.backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Modal Close Buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Modal Overlay Click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    loadUserData() {
        const savedName = localStorage.getItem('quizUserName');
        const savedStats = localStorage.getItem('quizUserStats');
        
        if (savedName) {
            this.currentUser = savedName;
        }
        
        if (savedStats) {
            this.userStats = JSON.parse(savedStats);
        }
    }
    
    saveUserData() {
        localStorage.setItem('quizUserName', this.currentUser);
        localStorage.setItem('quizUserStats', JSON.stringify(this.userStats));
    }
    
    loadQuizScores() {
        const savedScores = localStorage.getItem('quizScores');
        if (savedScores) {
            this.quizScores = JSON.parse(savedScores);
            this.elements.scoresCount.textContent = this.quizScores.length;
        }
    }
    
    saveQuizScores() {
        localStorage.setItem('quizScores', JSON.stringify(this.quizScores));
        this.elements.scoresCount.textContent = this.quizScores.length;
    }
    
    renderHomePage() {
        this.renderCategories();
        this.renderRecentScores();
    }
    
    renderCategories() {
        const container = this.elements.categoriesGrid || this.elements.categoriesList;
        if (!container) return;
        
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryCard = this.createCategoryCard(category);
            container.appendChild(categoryCard);
        });
    }
    
    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.category = category.id;
        
        // Calculate user stats for this category
        const categoryScores = this.quizScores.filter(score => score.category === category.id);
        const bestScore = categoryScores.length > 0 
            ? Math.max(...categoryScores.map(s => s.score)) 
            : 0;
        
        card.innerHTML = `
            <div class="category-header" style="background: linear-gradient(135deg, ${category.color}, ${this.lightenColor(category.color, 20)})">
                <i class="${category.icon}"></i>
                <h3>${category.name}</h3>
            </div>
            <div class="category-body">
                <div class="category-stats">
                    <span>${category.questionCount} Questions</span>
                    <span>Best: ${bestScore}%</span>
                </div>
                <p class="category-description">${category.description}</p>
                <div class="category-actions">
                    <button class="btn btn-primary" onclick="quizApp.startQuiz('${category.id}')">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                    <button class="btn btn-secondary" onclick="quizApp.showCategoryInfo('${category.id}')">
                        <i class="fas fa-info-circle"></i> Info
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    renderRecentScores() {
        if (this.quizScores.length === 0) {
            this.elements.recentScoresSection.style.display = 'none';
            return;
        }
        
        this.elements.recentScoresSection.style.display = 'block';
        this.elements.scoresTableBody.innerHTML = '';
        
        // Show only last 5 scores
        const recentScores = this.quizScores.slice(-5).reverse();
        
        recentScores.forEach(score => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(score.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            // Get category name
            const category = this.categories.find(c => c.id === score.category);
            const categoryName = category ? category.name : score.category;
            
            // Create score badge
            let scoreBadgeClass = 'average';
            if (score.score >= 80) scoreBadgeClass = 'excellent';
            else if (score.score >= 60) scoreBadgeClass = 'good';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${categoryName}</td>
                <td><span class="score-badge ${scoreBadgeClass}">${score.score}%</span></td>
                <td>${score.time}</td>
                <td>
                    <button class="btn btn-secondary btn-small" onclick="quizApp.viewScoreDetails('${score.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            this.elements.scoresTableBody.appendChild(row);
        });
    }
    
    updateUserDisplay() {
        this.elements.userName.textContent = this.currentUser;
        this.elements.displayUserName.textContent = this.currentUser;
        this.elements.userScore.textContent = this.userStats.totalScore;
        this.elements.quizzesTaken.textContent = this.userStats.quizzesTaken;
        
        // Calculate accuracy
        const accuracy = this.userStats.totalQuestions > 0 
            ? Math.round((this.userStats.correctAnswers / this.userStats.totalQuestions) * 100)
            : 0;
        this.elements.accuracyRate.textContent = `${accuracy}%`;
        
        // Update rank (simulated)
        const rank = this.userStats.totalScore > 1000 ? '#1,234' : '#N/A';
        this.elements.userRank.textContent = rank;
    }
    
    showHomeSection() {
        this.hideAllSections();
        this.elements.homeSection.style.display = 'block';
        this.updateActiveNav('home');
        this.renderHomePage();
        this.updateUserDisplay();
    }
    
    showQuizSection() {
        this.hideAllSections();
        this.elements.quizSection.style.display = 'block';
        this.updateActiveNav('quiz');
        
        // If no quiz is in progress, go back to home
        if (!this.quizStarted) {
            setTimeout(() => this.showHomeSection(), 100);
        }
    }
    
    showScoresSection() {
        this.hideAllSections();
        this.elements.scoresSection.style.display = 'block';
        this.updateActiveNav('scores');
        this.updateScoresDisplay();
    }
    
    showCategoriesSection() {
        this.hideAllSections();
        this.elements.categoriesSection.style.display = 'block';
        this.updateActiveNav('categories');
        this.renderCategories();
    }
    
    hideAllSections() {
        this.elements.homeSection.style.display = 'none';
        this.elements.quizSection.style.display = 'none';
        this.elements.scoresSection.style.display = 'none';
        this.elements.categoriesSection.style.display = 'none';
    }
    
    updateActiveNav(section) {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById(`${section}Link`).classList.add('active');
    }
    
    showNameModal() {
        this.elements.newUserName.value = this.currentUser;
        this.showModal(this.elements.nameModal);
    }
    
    saveUserName() {
        const newName = this.elements.newUserName.value.trim();
        if (newName && newName !== this.currentUser) {
            this.currentUser = newName;
            this.saveUserData();
            this.updateUserDisplay();
            this.showToast('Name updated successfully!', 'success');
        }
        this.closeModal(this.elements.nameModal);
    }
    
    showCategoryModal() {
        this.renderCategoryOptions();
        this.showModal(this.elements.categoryModal);
    }
    
    renderCategoryOptions() {
        this.elements.categoryOptions.innerHTML = '';
        
        this.categories.forEach(category => {
            const option = document.createElement('div');
            option.className = 'category-option';
            option.dataset.category = category.id;
            
            option.innerHTML = `
                <i class="${category.icon}"></i>
                <h4>${category.name}</h4>
                <p>${category.questionCount} questions</p>
            `;
            
            option.addEventListener('click', () => {
                document.querySelectorAll('.category-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
            
            this.elements.categoryOptions.appendChild(option);
        });
        
        // Select first category by default
        const firstOption = this.elements.categoryOptions.querySelector('.category-option');
        if (firstOption) firstOption.classList.add('selected');
    }
    
    startCategoryQuiz() {
        const selectedOption = this.elements.categoryOptions.querySelector('.category-option.selected');
        if (!selectedOption) return;
        
        const categoryId = selectedOption.dataset.category;
        const questionCount = parseInt(this.elements.questionCount.value);
        const difficulty = this.elements.difficultyLevel.value;
        const timeLimit = parseInt(this.elements.timeLimit.value);
        
        this.closeModal(this.elements.categoryModal);
        this.startQuiz(categoryId, questionCount, difficulty, timeLimit);
    }
    
    startRandomQuiz() {
        // Select a random category
        const randomCategory = this.categories[Math.floor(Math.random() * this.categories.length)];
        this.startQuiz(randomCategory.id, 10, 'mixed', 0);
    }
    
    startQuiz(categoryId, questionCount = 10, difficulty = 'mixed', timeLimit = 0) {
        // Generate questions
        this.generateQuestions(categoryId, questionCount, difficulty);
        
        // Set up quiz state
        this.currentQuiz = {
            category: categoryId,
            questionCount: questionCount,
            difficulty: difficulty,
            timeLimit: timeLimit,
            startTime: new Date(),
            questions: this.questions,
            userAnswers: [],
            correctAnswers: 0
        };
        
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = 0;
        this.selectedAnswer = null;
        this.quizStarted = true;
        
        // Update UI
        this.showQuizSection();
        this.updateQuizHeader();
        this.updateQuestionList();
        this.loadQuestion();
        this.startTimer();
    }
    
    generateQuestions(categoryId, count, difficulty) {
        this.questions = [];
        
        // Sample questions for each category
        const questionTemplates = {
            general: [
                {
                    question: "What is the capital of France?",
                    answers: ["London", "Berlin", "Paris", "Madrid"],
                    correctAnswer: 2,
                    difficulty: "easy",
                    hint: "It's known as the 'City of Light'"
                },
                {
                    question: "Which planet is known as the Red Planet?",
                    answers: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correctAnswer: 1,
                    difficulty: "easy",
                    hint: "It's the fourth planet from the Sun"
                },
                {
                    question: "Who wrote 'Romeo and Juliet'?",
                    answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                    correctAnswer: 1,
                    difficulty: "easy",
                    hint: "He's often called England's national poet"
                }
            ],
            science: [
                {
                    question: "What is H2O commonly known as?",
                    answers: ["Carbon Dioxide", "Salt", "Water", "Oxygen"],
                    correctAnswer: 2,
                    difficulty: "easy",
                    hint: "It covers about 71% of Earth's surface"
                },
                {
                    question: "Which element has the atomic number 1?",
                    answers: ["Helium", "Oxygen", "Hydrogen", "Carbon"],
                    correctAnswer: 2,
                    difficulty: "medium",
                    hint: "It's the lightest element"
                }
            ],
            history: [
                {
                    question: "In which year did World War II end?",
                    answers: ["1943", "1944", "1945", "1946"],
                    correctAnswer: 2,
                    difficulty: "medium",
                    hint: "It ended after the surrender of Japan"
                }
            ]
        };
        
        // Get questions for the selected category, or use general as fallback
        const templates = questionTemplates[categoryId] || questionTemplates.general;
        
        // Generate questions (in a real app, this would fetch from an API)
        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            const question = {
                ...template,
                id: i + 1,
                category: categoryId
            };
            this.questions.push(question);
        }
        
        // Filter by difficulty if not mixed
        if (difficulty !== 'mixed') {
            this.questions = this.questions.filter(q => q.difficulty === difficulty);
        }
    }
    
    updateQuizHeader() {
        const category = this.categories.find(c => c.id === this.currentQuiz.category);
        const categoryName = category ? category.name : this.currentQuiz.category;
        
        this.elements.quizCategoryBadge.innerHTML = `<i class="fas fa-${category?.icon?.split(' ')[1] || 'globe'}"></i> <span>${categoryName}</span>`;
        this.elements.quizTitle.textContent = `${categoryName} Quiz`;
        this.elements.totalQuestionsCount.textContent = this.currentQuiz.questionCount;
        
        // Update sidebar
        this.elements.sidebarCategory.textContent = categoryName;
        this.elements.sidebarDifficulty.textContent = this.currentQuiz.difficulty.charAt(0).toUpperCase() + this.currentQuiz.difficulty.slice(1);
        this.elements.sidebarQuestionCount.textContent = this.currentQuiz.questionCount;
        this.elements.sidebarTimeLimit.textContent = this.currentQuiz.timeLimit > 0 
            ? `${this.currentQuiz.timeLimit} seconds` 
            : 'No limit';
    }
    
    updateQuestionList() {
        this.elements.questionList.innerHTML = '';
        
        for (let i = 0; i < this.currentQuiz.questionCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'question-number-btn';
            btn.textContent = i + 1;
            btn.dataset.index = i;
            
            if (i === this.currentQuestionIndex) {
                btn.classList.add('active');
            }
            
            // Mark answered questions
            if (i < this.currentQuestionIndex) {
                const answer = this.currentQuiz.userAnswers[i];
                if (answer !== undefined) {
                    btn.classList.add('answered');
                }
            }
            
            btn.addEventListener('click', () => {
                if (i < this.currentQuestionIndex) {
                    this.currentQuestionIndex = i;
                    this.loadQuestion();
                }
            });
            
            this.elements.questionList.appendChild(btn);
        }
    }
    
    loadQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            this.endQuiz();
            return;
        }
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        
        // Update question info
        this.elements.currentQuestionNumber.textContent = this.currentQuestionIndex + 1;
        this.elements.questionNumber.textContent = this.currentQuestionIndex + 1;
        this.elements.questionText.textContent = question.question;
        
        // Update difficulty
        this.elements.questionDifficulty.textContent = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
        this.elements.questionDifficulty.className = `question-difficulty ${question.difficulty}`;
        
        // Hide hint
        this.elements.questionHint.style.display = 'none';
        this.elements.hintText.textContent = question.hint || 'No hint available';
        
        // Hide image container
        this.elements.questionImageContainer.style.display = 'none';
        
        // Load answers
        this.renderAnswers(question.answers);
        
        // Update progress
        const progress = ((this.currentQuestionIndex) / this.currentQuiz.questionCount) * 100;
        this.elements.progressBar.querySelector('.progress-fill').style.width = `${progress}%`;
        this.elements.progressPercent.textContent = Math.round(progress);
        
        // Update question list active state
        document.querySelectorAll('.question-number-btn').forEach((btn, index) => {
            btn.classList.remove('active');
            if (index === this.currentQuestionIndex) {
                btn.classList.add('active');
            }
        });
        
        // Reset selected answer
        this.selectedAnswer = null;
        this.elements.quizFeedback.style.display = 'none';
        this.elements.nextBtn.textContent = 'Next Question';
        this.elements.nextBtn.disabled = true;
    }
    
    renderAnswers(answers) {
        this.elements.answersContainer.innerHTML = '';
        
        const answerLetters = ['A', 'B', 'C', 'D'];
        
        answers.forEach((answer, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.dataset.index = index;
            
            answerElement.innerHTML = `
                <div class="answer-letter">${answerLetters[index]}</div>
                <div class="answer-text">${answer}</div>
            `;
            
            answerElement.addEventListener('click', () => this.selectAnswer(index));
            
            this.elements.answersContainer.appendChild(answerElement);
        });
    }
    
    selectAnswer(answerIndex) {
        // Only allow selection if no answer has been selected yet
        if (this.selectedAnswer !== null) return;
        
        this.selectedAnswer = answerIndex;
        
        // Mark selected answer
        document.querySelectorAll('.answer-option').forEach((option, index) => {
            option.classList.remove('selected');
            if (index === answerIndex) {
                option.classList.add('selected');
            }
        });
        
        this.elements.nextBtn.disabled = false;
    }
    
    showHint() {
        this.elements.questionHint.style.display = 'flex';
    }
    
    skipQuestion() {
        // Mark as skipped
        this.currentQuiz.userAnswers[this.currentQuestionIndex] = null;
        
        // Move to next question
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
            this.loadQuestion();
        } else {
            this.endQuiz();
        }
    }
    
    nextQuestion() {
        if (this.selectedAnswer === null) return;
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correctAnswer;
        
        // Store user's answer
        this.currentQuiz.userAnswers[this.currentQuestionIndex] = {
            answer: this.selectedAnswer,
            correct: isCorrect
        };
        
        // Update score if correct
        if (isCorrect) {
            this.score += 10;
            this.elements.currentScore.textContent = this.score;
            
            // Show correct feedback
            this.showFeedback(true, "Correct!", "Well done!");
        } else {
            // Show incorrect feedback with correct answer
            const correctAnswer = question.answers[question.correctAnswer];
            this.showFeedback(false, "Incorrect", `The correct answer is: ${correctAnswer}`);
        }
        
        // Mark answer in question list
        const questionBtn = this.elements.questionList.querySelector(`[data-index="${this.currentQuestionIndex}"]`);
        if (questionBtn) {
            questionBtn.classList.remove('answered', 'skipped');
            questionBtn.classList.add(isCorrect ? 'answered' : 'skipped');
        }
        
        // Wait a moment, then move to next question
        setTimeout(() => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
                this.loadQuestion();
            } else {
                this.endQuiz();
            }
        }, 2000);
    }
    
    showFeedback(isCorrect, title, message) {
        this.elements.quizFeedback.style.display = 'block';
        this.elements.quizFeedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        this.elements.feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        this.elements.feedbackIcon.innerHTML = `<i class="fas fa-${isCorrect ? 'check' : 'times'}-circle"></i>`;
        this.elements.feedbackTitle.textContent = title;
        this.elements.feedbackMessage.textContent = message;
        
        // Mark answers as correct/incorrect
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        document.querySelectorAll('.answer-option').forEach((option, index) => {
            if (index === question.correctAnswer) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.elements.quizTimer.textContent = `${minutes}:${seconds}`;
    }
    
    pauseQuiz() {
        if (!this.quizStarted || this.quizPaused) return;
        
        this.quizPaused = true;
        clearInterval(this.timerInterval);
        
        // Update pause modal
        this.elements.pauseScore.textContent = this.score;
        this.elements.pauseQuestions.textContent = `${this.currentQuestionIndex}/${this.currentQuiz.questionCount}`;
        
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.elements.pauseTime.textContent = `${minutes}:${seconds}`;
        
        this.showModal(this.elements.pauseModal);
    }
    
    resumeQuiz() {
        this.quizPaused = false;
        this.startTimer();
        this.closeModal(this.elements.pauseModal);
    }
    
    quitQuiz() {
        if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
            this.quizStarted = false;
            this.quizPaused = false;
            clearInterval(this.timerInterval);
            this.closeModal(this.elements.pauseModal);
            this.showHomeSection();
        }
    }
    
    endQuiz() {
        clearInterval(this.timerInterval);
        this.quizStarted = false;
        
        // Calculate final score
        const totalQuestions = this.currentQuiz.questionCount;
        const correctAnswers = this.currentQuiz.userAnswers.filter(answer => answer?.correct).length;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Update results modal
        this.elements.finalScore.textContent = this.score;
        this.elements.correctAnswers.textContent = `${correctAnswers}/${totalQuestions}`;
        this.elements.accuracyResult.textContent = `${accuracy}%`;
        
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.elements.timeTaken.textContent = `${minutes}:${seconds}`;
        
        // Render question review
        this.renderQuestionReview();
        
        // Create score record
        const scoreRecord = {
            id: Date.now().toString(),
            category: this.currentQuiz.category,
            score: accuracy,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            time: `${minutes}:${seconds}`,
            date: new Date().toISOString()
        };
        
        // Save score
        this.quizScores.push(scoreRecord);
        this.saveQuizScores();
        
        // Update user stats
        this.userStats.totalScore += this.score;
        this.userStats.quizzesTaken++;
        this.userStats.totalQuestions += totalQuestions;
        this.userStats.correctAnswers += correctAnswers;
        this.saveUserData();
        
        // Show results modal
        this.showModal(this.elements.resultsModal);
        
        // Show confetti if score is good
        if (accuracy >= 80) {
            this.showConfetti();
        }
    }
    
    renderQuestionReview() {
        this.elements.questionReviewContainer.innerHTML = '';
        
        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.currentQuiz.userAnswers[index];
            const isCorrect = userAnswer?.correct || false;
            const userAnswerText = userAnswer !== null && userAnswer !== undefined 
                ? question.answers[userAnswer.answer] 
                : 'Skipped';
            const correctAnswerText = question.answers[question.correctAnswer];
            
            const reviewItem = document.createElement('div');
            reviewItem.className = `question-review-item ${isCorrect ? 'correct' : 'incorrect'}`;
            
            reviewItem.innerHTML = `
                <div class="review-question">${index + 1}. ${question.question}</div>
                <div class="review-answer ${isCorrect ? 'correct' : 'incorrect'}">
                    <span>Your answer: ${userAnswerText}</span>
                    ${!isCorrect ? `<span>Correct: ${correctAnswerText}</span>` : ''}
                </div>
            `;
            
            this.elements.questionReviewContainer.appendChild(reviewItem);
        });
    }
    
    retryQuiz() {
        this.closeModal(this.elements.resultsModal);
        this.startQuiz(
            this.currentQuiz.category,
            this.currentQuiz.questionCount,
            this.currentQuiz.difficulty,
            this.currentQuiz.timeLimit
        );
    }
    
    startNewQuiz() {
        this.closeModal(this.elements.resultsModal);
        this.showHomeSection();
    }
    
    shareResults() {
        const score = this.elements.accuracyResult.textContent;
        const text = `I scored ${score} on the ${this.currentQuiz.category} quiz! Try it yourself at QuizMaster.`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'My Quiz Results',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Results copied to clipboard!', 'success');
            });
        }
    }
    
    updateScoresDisplay() {
        const categoryFilter = this.elements.scoreCategoryFilter.value;
        const timeFilter = this.elements.scoreTimeFilter.value;
        
        // Filter scores
        let filteredScores = [...this.quizScores];
        
        if (categoryFilter !== 'all') {
            filteredScores = filteredScores.filter(score => score.category === categoryFilter);
        }
        
        if (timeFilter !== 'all') {
            const now = new Date();
            filteredScores = filteredScores.filter(score => {
                const scoreDate = new Date(score.date);
                switch (timeFilter) {
                    case 'today':
                        return scoreDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                        return scoreDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                        return scoreDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Update summary stats
        this.updateScoreSummary(filteredScores);
        
        // Update chart
        this.updateScoresChart(filteredScores);
        
        // Update detailed scores
        this.updateDetailedScores(filteredScores);
    }
    
    updateScoreSummary(scores) {
        if (scores.length === 0) {
            this.elements.totalScoreDisplay.textContent = '0';
            this.elements.averageScoreDisplay.textContent = '0%';
            this.elements.bestScoreDisplay.textContent = '0%';
            this.elements.totalTimeDisplay.textContent = '0m';
            return;
        }
        
        const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
        const averageScore = Math.round(totalScore / scores.length);
        const bestScore = Math.max(...scores.map(s => s.score));
        const totalMinutes = scores.reduce((sum, score) => {
            const [minutes, seconds] = score.time.split(':').map(Number);
            return sum + minutes + (seconds / 60);
        }, 0);
        
        this.elements.totalScoreDisplay.textContent = totalScore;
        this.elements.averageScoreDisplay.textContent = `${averageScore}%`;
        this.elements.bestScoreDisplay.textContent = `${bestScore}%`;
        this.elements.totalTimeDisplay.textContent = `${Math.round(totalMinutes)}m`;
    }
    
    updateScoresChart(scores = this.quizScores) {
        const ctx = document.getElementById('scoresChart').getContext('2d');
        const chartType = this.elements.chartTypeSelect.value;
        
        // Destroy previous chart if exists
        if (this.scoresChart) {
            this.scoresChart.destroy();
        }
        
        // Prepare data
        const labels = scores.map((score, index) => `Quiz ${index + 1}`);
        const data = scores.map(score => score.score);
        
        // Create chart
        this.scoresChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score (%)',
                    data: data,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 2,
                    fill: chartType === 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    updateDetailedScores(scores) {
        this.elements.detailedScoresContainer.innerHTML = '';
        
        scores.forEach(score => {
            const category = this.categories.find(c => c.id === score.category);
            const categoryName = category ? category.name : score.category;
            
            const scoreCard = document.createElement('div');
            scoreCard.className = 'detailed-score-card';
            
            const date = new Date(score.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            scoreCard.innerHTML = `
                <div class="score-card-left">
                    <div class="score-card-category">${categoryName}</div>
                    <div class="score-card-date">${formattedDate}</div>
                </div>
                <div class="score-card-right">
                    <div class="score-card-score">${score.score}%</div>
                    <div class="score-card-time">${score.time} • ${score.correctAnswers}/${score.totalQuestions} correct</div>
                </div>
            `;
            
            this.elements.detailedScoresContainer.appendChild(scoreCard);
        });
    }
    
    viewScoreDetails(scoreId) {
        const score = this.quizScores.find(s => s.id === scoreId);
        if (!score) return;
        
        alert(`Score Details:\nCategory: ${score.category}\nScore: ${score.score}%\nCorrect Answers: ${score.correctAnswers}/${score.totalQuestions}\nTime: ${score.time}`);
    }
    
    clearScores() {
        if (confirm('Are you sure you want to clear all your quiz scores? This action cannot be undone.')) {
            this.quizScores = [];
            this.saveQuizScores();
            this.renderRecentScores();
            this.showToast('All scores cleared!', 'success');
        }
    }
    
    resetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This will clear your scores and stats.')) {
            this.userStats = {
                totalScore: 0,
                quizzesTaken: 0,
                totalQuestions: 0,
                correctAnswers: 0
            };
            this.quizScores = [];
            this.currentUser = 'Guest';
            
            this.saveUserData();
            this.saveQuizScores();
            
            this.updateUserDisplay();
            this.renderRecentScores();
            this.showToast('Progress reset successfully!', 'success');
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 
                                   type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)';
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = 'var(--border-radius-sm)';
        toast.style.boxShadow = 'var(--card-shadow)';
        toast.style.zIndex = '9999';
        toast.style.animation = 'slideInUp 0.3s ease';
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        // Add CSS animations if not already present
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOutDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showConfetti() {
        const canvas = this.elements.confettiCanvas;
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const confettiPieces = [];
        const confettiCount = 150;
        
        // Create confetti pieces
        for (let i = 0; i < confettiCount; i++) {
            confettiPieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 10 + 5,
                d: Math.random() * confettiCount,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                tilt: Math.random() * 10 - 10,
                tiltAngleIncrement: Math.random() * 0.07 + 0.05,
                tiltAngle: 0
            });
        }
        
        let animationId;
        
        function drawConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            confettiPieces.forEach(p => {
                ctx.beginPath();
                ctx.lineWidth = p.d / 2;
                ctx.fillStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
                ctx.fill();
                
                p.tiltAngle += p.tiltAngleIncrement;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle) * 15;
                
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
            });
            
            animationId = requestAnimationFrame(drawConfetti);
        }
        
        drawConfetti();
        
        // Stop confetti after 3 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
        }, 3000);
    }
    
    showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    closeAllModals() {
        this.closeModal(this.elements.resultsModal);
        this.closeModal(this.elements.nameModal);
        this.closeModal(this.elements.categoryModal);
        this.closeModal(this.elements.pauseModal);
    }
    
    setupTheme() {
        const savedTheme = localStorage.getItem('quizTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quizTheme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});