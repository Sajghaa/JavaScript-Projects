// app.js - Main application (CORRECTED)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Quiz Platform...');
    
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    
    // Initialize components
    const quizCard = new QuizCard(stateManager, eventBus);
    const questionCard = new QuestionCard(stateManager, eventBus);
    const resultCard = new ResultCard(stateManager, eventBus);
    const progressBar = new ProgressBar(stateManager, eventBus);
    const leaderboard = new Leaderboard(stateManager, eventBus);
    
    const questionManager = new QuestionManager(stateManager, eventBus);
    const timerManager = new TimerManager(stateManager, eventBus);
    const scoreManager = new ScoreManager(stateManager, eventBus);
    const quizManager = new QuizManager(stateManager, eventBus, questionManager, timerManager, scoreManager);
    const categoryManager = new CategoryManager(stateManager, eventBus, quizManager);
    
    // Make everything globally accessible
    window.app = {
        stateManager,
        eventBus,
        questionManager,
        timerManager,
        scoreManager,
        quizManager,
        categoryManager,
        quizCard,
        questionCard,
        resultCard,
        progressBar,
        leaderboard
    };
    
    // Render categories
    const renderCategories = () => {
        const container = document.getElementById('categoriesGrid');
        if (!container) {
            console.error('categoriesGrid not found');
            return;
        }
        const categories = stateManager.get('categories');
        
        container.innerHTML = categories.map(category => quizCard.render(category)).join('');
        
        container.querySelectorAll('.category-card').forEach((card, index) => {
            const categoryId = categories[index].id;
            card.onclick = (e) => {
                e.stopPropagation();
                console.log('Category clicked:', categoryId);
                const category = stateManager.get('categories').find(c => c.id === categoryId);
                if (category && quizManager.selectQuiz) {
                    quizManager.selectQuiz(category);
                } else {
                    console.error('Category not found or quizManager missing');
                }
            };
        });
    };
    
    // Navigation
    window.navigateTo = (screen) => {
        console.log('Global navigate to:', screen);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`${screen}Screen`);
        if (target) target.classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.nav === screen);
        });
        
        if (screen === 'leaderboard') {
            renderLeaderboard();
        }
    };
    
    // Render leaderboard
    const renderLeaderboard = () => {
        const leaderboardData = stateManager.get('leaderboard');
        const container = document.getElementById('leaderboardList');
        const currentUser = stateManager.get('user');
        
        if (leaderboardData.length === 0) {
            container.innerHTML = leaderboard.renderEmpty();
        } else {
            container.innerHTML = leaderboard.render(leaderboardData, currentUser.name);
            leaderboard.attachEvents(container);
        }
    };
    
    // Update profile
    const updateProfile = () => {
        const user = stateManager.get('user');
        document.getElementById('playerName').textContent = user.name;
        document.getElementById('totalPoints').textContent = user.totalPoints;
        document.getElementById('totalCorrect').textContent = user.totalCorrect;
        document.getElementById('totalQuizzes').textContent = user.totalQuizzes;
        
        const avgScore = user.totalQuizzes ? 
            Math.round((user.totalCorrect / (user.totalQuizzes * 10)) * 100) : 0;
        document.getElementById('avgScore').textContent = `${avgScore}%`;
        document.getElementById('totalTime').textContent = Math.floor(user.totalTime / 3600);
        
        // Render achievements
        const achievementsContainer = document.getElementById('achievementsList');
        const achievements = user.achievements;
        const allAchievements = [
            { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: '🎯' },
            { id: 'perfect_score', name: 'Perfect!', desc: 'Get 100% on any quiz', icon: '⭐' },
            { id: 'quiz_master', name: 'Quiz Master', desc: 'Complete 10 quizzes', icon: '🏆' },
            { id: 'time_keeper', name: 'Time Keeper', desc: 'Complete a quiz with no time left', icon: '⏰' },
            { id: 'points_collector', name: 'Points Collector', desc: 'Earn 1000 total points', icon: '💰' }
        ];
        
        achievementsContainer.innerHTML = allAchievements.map(ach => {
            const unlocked = achievements.find(a => a.id === ach.id);
            return `
                <div class="achievement-card ${!unlocked ? 'locked' : ''}">
                    <div class="achievement-icon">${ach.icon}</div>
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    ${unlocked ? '<small>✓ Unlocked</small>' : '<small>🔒 Locked</small>'}
                </div>
            `;
        }).join('');
    };
    
    // Event listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => navigateTo(item.dataset.nav);
    });
    
    document.getElementById('themeToggle').onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    };
    
    document.getElementById('editNameBtn').onclick = () => {
        const newName = prompt('Enter your name:', stateManager.get('user.name'));
        if (newName && newName.trim()) {
            stateManager.set('user.name', newName.trim());
            document.getElementById('playerName').textContent = newName.trim();
            renderLeaderboard();
        }
    };
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Subscriptions
    stateManager.subscribe('user', updateProfile);
    stateManager.subscribe('leaderboard', renderLeaderboard);
    
    // Toast notifications
    class NotificationToast {
        show(message, type = 'success', duration = 3000) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast ${type} show`;
            setTimeout(() => toast.classList.remove('show'), duration);
        }
    }
    const toast = new NotificationToast();
    eventBus.on('toast', ({ message, type }) => toast.show(message, type));
    
    // Initialize
    renderCategories();
    updateProfile();
    renderLeaderboard();
    
    console.log('Quiz Platform Initialized Successfully!');
});