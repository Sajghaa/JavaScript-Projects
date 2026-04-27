// StateManager.js
class StateManager {
    constructor() {
        this.state = {
            user: { name: 'Quiz Master', totalPoints: 0, totalCorrect: 0, totalQuizzes: 0, achievements: [] },
            quizzes: [],
            leaderboard: [],
            categories: [
                { id: 'general', name: 'General Knowledge', icon: '🌍', quizCount: 5 },
                { id: 'science', name: 'Science', icon: '🔬', quizCount: 5 },
                { id: 'history', name: 'History', icon: '📜', quizCount: 5 },
                { id: 'technology', name: 'Technology', icon: '💻', quizCount: 5 }
            ],
            settings: { theme: 'light' }
        };
        this.listeners = new Map();
        this.loadFromStorage();
    }

    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[lastKey] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) this.listeners.set(path, new Set());
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(cb => cb(value));
        }
    }

    addQuizResult(quizId, score, points, answers) {
        this.state.user.totalPoints += points;
        this.state.user.totalCorrect += answers.filter(a => a.isCorrect).length;
        this.state.user.totalQuizzes++;
        this.checkAchievements();
        this.notifyListeners('user', this.state.user);
        this.saveToStorage();
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: '🎯' },
            { id: 'perfect_score', name: 'Perfect!', desc: 'Get 100% on any quiz', icon: '⭐' }
        ];
        achievements.forEach(ach => {
            if (!this.state.user.achievements.find(a => a.id === ach.id)) {
                if (ach.id === 'first_quiz' && this.state.user.totalQuizzes >= 1) {
                    this.state.user.achievements.push({ ...ach, unlockedAt: new Date().toISOString() });
                }
            }
        });
    }

    saveToStorage() {
        try {
            localStorage.setItem('quiz_app_state', JSON.stringify({
                user: this.state.user,
                settings: this.state.settings
            }));
        } catch(e) { console.error(e); }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('quiz_app_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.user = { ...this.state.user, ...data.user };
                this.state.settings = { ...this.state.settings, ...data.settings };
            }
        } catch(e) { console.error(e); }
    }
}
window.StateManager = StateManager;