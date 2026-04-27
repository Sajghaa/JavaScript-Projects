// app.js - Complete Working Version
document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    
    // ============ QUIZ DATA ============
    const quizQuestions = {
        general: [
            { text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
            { text: "Which planet is known as the Red Planet?", options: ["Mars", "Jupiter", "Venus", "Saturn"], correct: 0 },
            { text: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2 },
            { text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
            { text: "Which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2 }
        ],
        science: [
            { text: "What is H2O commonly known as?", options: ["Oxygen", "Hydrogen", "Water", "Salt"], correct: 2 },
            { text: "What is the hardest natural substance?", options: ["Iron", "Gold", "Diamond", "Platinum"], correct: 2 },
            { text: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Hydrogen", "Carbon Dioxide"], correct: 3 },
            { text: "What is the center of an atom called?", options: ["Proton", "Neutron", "Electron", "Nucleus"], correct: 3 },
            { text: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correct: 0 }
        ],
        history: [
            { text: "Who discovered America in 1492?", options: ["Columbus", "Magellan", "Cook", "Vespucci"], correct: 0 },
            { text: "Which ancient civilization built Machu Picchu?", options: ["Aztecs", "Mayans", "Incas", "Olmecs"], correct: 2 },
            { text: "Who was the first man on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], correct: 1 },
            { text: "When did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2 },
            { text: "Who painted the Sistine Chapel?", options: ["Da Vinci", "Michelangelo", "Raphael", "Donatello"], correct: 1 }
        ],
        technology: [
            { text: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"], correct: 1 },
            { text: "What does CPU stand for?", options: ["Computer Processing Unit", "Central Processing Unit", "Core Processing Unit", "Central Processor Unit"], correct: 1 },
            { text: "Which company created the iPhone?", options: ["Samsung", "Google", "Apple", "Microsoft"], correct: 2 },
            { text: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Augmented Intelligence", "Advanced Intelligence"], correct: 1 },
            { text: "Which programming language is known for web development?", options: ["Python", "Java", "JavaScript", "C++"], correct: 2 }
        ]
    };

    // ============ QUIZ STATE ============
    let currentCategory = null;
    let currentQuestions = [];
    let currentIndex = 0;
    let userAnswers = [];
    let quizTimer = null;
    let timeLeft = 0;
    let currentScore = 0;
    let selectedCategoryId = null;

    // ============ UI ELEMENTS ============
    const homeScreen = document.getElementById('homeScreen');
    const setupScreen = document.getElementById('quizSetupScreen');
    const quizScreen = document.getElementById('quizScreen');
    const resultsScreen = document.getElementById('resultsScreen');
    const profileScreen = document.getElementById('profileScreen');

    // ============ HELPERS ============
    function showScreen(screenName) {
        homeScreen.classList.remove('active');
        setupScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        resultsScreen.classList.remove('active');
        profileScreen.classList.remove('active');
        
        if (screenName === 'home') homeScreen.classList.add('active');
        else if (screenName === 'setup') setupScreen.classList.add('active');
        else if (screenName === 'quiz') quizScreen.classList.add('active');
        else if (screenName === 'results') resultsScreen.classList.add('active');
        else if (screenName === 'profile') profileScreen.classList.add('active');
        
        // Update bottom nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.nav === screenName);
        });
    }
    
    window.navigateTo = showScreen;

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function stopTimer() {
        if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('timeLeft').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const timerDiv = document.getElementById('timerDisplay');
        if (timeLeft <= 10 && timeLeft > 0) timerDiv.classList.add('warning');
        else timerDiv.classList.remove('warning');
    }

    function startTimer(seconds, onTimeout) {
        stopTimer();
        timeLeft = seconds;
        updateTimerDisplay();
        quizTimer = setInterval(() => {
            if (timeLeft <= 1) {
                stopTimer();
                if (onTimeout) onTimeout();
            } else {
                timeLeft--;
                updateTimerDisplay();
            }
        }, 1000);
    }

    // ============ RENDER CATEGORIES ============
    function renderCategories() {
        const container = document.getElementById('categoriesGrid');
        const categories = stateManager.get('categories');
        container.innerHTML = categories.map(cat => `
            <div class="category-card" data-category="${cat.id}">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-title">${cat.name}</div>
                <div class="category-stats"><span>${cat.quizCount} quizzes</span></div>
            </div>
        `).join('');
        
        document.querySelectorAll('.category-card').forEach(card => {
            card.onclick = () => {
                selectedCategoryId = card.dataset.category;
                const category = categories.find(c => c.id === selectedCategoryId);
                currentCategory = category;
                document.getElementById('quizInfo').innerHTML = `<h2>${category.name}</h2><p>${category.icon} Test your knowledge in ${category.name}</p>`;
                showScreen('setup');
            };
        });
    }

    // ============ START QUIZ ============
    function startQuiz() {
        const questionCount = parseInt(document.getElementById('questionCount').value);
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        
        // Get questions for category
        let allQuestions = [...quizQuestions[selectedCategoryId]];
        // Shuffle and take requested count
        for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }
        currentQuestions = allQuestions.slice(0, questionCount).map((q, idx) => ({
            id: idx,
            text: q.text,
            options: q.options,
            correctIndex: q.correct,
            userAnswer: null
        }));
        
        currentIndex = 0;
        userAnswers = [];
        currentScore = 0;
        
        document.getElementById('totalQ').textContent = currentQuestions.length;
        document.getElementById('currentScore').textContent = '0';
        
        if (timeLimit > 0) {
            startTimer(timeLimit, () => submitQuiz());
        }
        
        renderCurrentQuestion();
        showScreen('quiz');
    }

    function renderCurrentQuestion() {
        const question = currentQuestions[currentIndex];
        const letters = ['A', 'B', 'C', 'D'];
        const container = document.getElementById('questionContainer');
        
        container.innerHTML = `
            <div class="question-text">${question.text}</div>
            <div class="options-list">
                ${question.options.map((opt, idx) => `
                    <div class="option-item ${question.userAnswer === idx ? 'selected' : ''}" data-opt-index="${idx}">
                        <div class="option-letter">${letters[idx]}</div>
                        <div class="option-text">${opt}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click listeners
        document.querySelectorAll('.option-item').forEach(opt => {
            opt.onclick = () => {
                const selectedIndex = parseInt(opt.dataset.optIndex);
                // Remove selected class from all options
                container.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                currentQuestions[currentIndex].userAnswer = selectedIndex;
                updateCurrentScore();
            };
        });
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = (currentIndex === 0);
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (currentIndex === currentQuestions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
        
        document.getElementById('currentQ').textContent = currentIndex + 1;
        const progress = ((currentIndex + 1) / currentQuestions.length) * 100;
        document.getElementById('quizProgress').style.width = `${progress}%`;
    }

    function updateCurrentScore() {
        let score = 0;
        currentQuestions.forEach(q => {
            if (q.userAnswer !== null && q.userAnswer === q.correctIndex) {
                score += 10;
            }
        });
        currentScore = score;
        document.getElementById('currentScore').textContent = currentScore;
    }

    function nextQuestion() {
        if (currentIndex < currentQuestions.length - 1) {
            currentIndex++;
            renderCurrentQuestion();
        }
    }

    function prevQuestion() {
        if (currentIndex > 0) {
            currentIndex--;
            renderCurrentQuestion();
        }
    }

    function submitQuiz() {
        stopTimer();
        
        // Calculate results
        let correct = 0;
        const answers = [];
        currentQuestions.forEach(q => {
            const isCorrect = (q.userAnswer !== null && q.userAnswer === q.correctIndex);
            if (isCorrect) correct++;
            answers.push({
                question: q.text,
                selectedAnswer: q.userAnswer !== null ? q.options[q.userAnswer] : 'No answer',
                correctAnswer: q.options[q.correctIndex],
                isCorrect: isCorrect
            });
        });
        
        const scorePercent = Math.round((correct / currentQuestions.length) * 100);
        const pointsEarned = correct * 10;
        
        // Save results
        stateManager.addQuizResult(currentCategory.id, scorePercent, pointsEarned, answers);
        
        // Update UI
        document.getElementById('finalScore').textContent = scorePercent;
        document.getElementById('correctCount').textContent = correct;
        document.getElementById('incorrectCount').textContent = currentQuestions.length - correct;
        document.getElementById('pointsEarned').textContent = pointsEarned;
        
        // Update score circle
        const angle = (scorePercent / 100) * 360;
        document.getElementById('scoreCircle').style.background = `conic-gradient(#6366f1 ${angle}deg, #e5e7eb ${angle}deg)`;
        
        // Render review answers
        const reviewContainer = document.getElementById('answersReview');
        reviewContainer.innerHTML = answers.map((a, i) => `
            <div class="review-item">
                <div class="review-question">${i + 1}. ${a.question}</div>
                <div class="review-answer ${a.isCorrect ? 'correct' : 'incorrect'}">
                    Your answer: ${a.selectedAnswer}<br>
                    ${!a.isCorrect ? `Correct answer: ${a.correctAnswer}` : ''}
                </div>
            </div>
        `).join('');
        
        showScreen('results');
        updateProfileStats();
    }

    // ============ PROFILE ============
    function updateProfileStats() {
        const user = stateManager.get('user');
        document.getElementById('playerName').textContent = user.name;
        document.getElementById('totalPoints').textContent = user.totalPoints;
        document.getElementById('totalCorrect').textContent = user.totalCorrect;
        document.getElementById('totalQuizzes').textContent = user.totalQuizzes;
        
        // Render achievements
        const achievements = stateManager.get('user.achievements');
        const allAchievements = [
            { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: '🎯' },
            { id: 'perfect_score', name: 'Perfect!', desc: 'Get 100% on any quiz', icon: '⭐' }
        ];
        const achievementsContainer = document.getElementById('achievementsList');
        achievementsContainer.innerHTML = allAchievements.map(ach => {
            const unlocked = achievements.find(a => a.id === ach.id);
            return `<div class="achievement-card ${!unlocked ? 'locked' : ''}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${unlocked ? '<small>✓ Unlocked</small>' : '<small>🔒 Locked</small>'}
            </div>`;
        }).join('');
    }

    // ============ EVENT LISTENERS ============
    document.getElementById('startQuizBtn').onclick = startQuiz;
    document.getElementById('nextBtn').onclick = nextQuestion;
    document.getElementById('prevBtn').onclick = prevQuestion;
    document.getElementById('submitBtn').onclick = submitQuiz;
    document.getElementById('retakeBtn').onclick = startQuiz;
    document.getElementById('newQuizBtn').onclick = () => showScreen('home');
    
    let reviewVisible = false;
    document.getElementById('reviewBtn').onclick = () => {
        const section = document.getElementById('reviewSection');
        reviewVisible = !reviewVisible;
        section.style.display = reviewVisible ? 'block' : 'none';
        document.getElementById('reviewBtn').innerHTML = reviewVisible ? 'Hide Review' : 'Review Answers';
    };
    
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    document.getElementById('editNameBtn').onclick = () => {
        const newName = prompt('Enter your name:', stateManager.get('user.name'));
        if (newName && newName.trim()) {
            stateManager.set('user.name', newName.trim());
            updateProfileStats();
        }
    };
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => showScreen(item.dataset.nav);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize
    renderCategories();
    updateProfileStats();
    stateManager.subscribe('user', updateProfileStats);
    
    console.log('Quiz Platform Ready!');
});