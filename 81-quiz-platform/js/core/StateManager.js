// StateManager.js - Centralized state management
class StateManager {
    constructor() {
        this.state = {
            user: {
                name: 'Quiz Master',
                totalPoints: 0,
                totalCorrect: 0,
                totalQuizzes: 0,
                totalTime: 0,
                achievements: []
            },
            quizzes: [],
            currentQuiz: null,
            leaderboard: [],
            categories: [],
            settings: {
                theme: 'light',
                soundEnabled: true
            }
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
        this.initializeData();
    }

    initializeData() {
        if (this.state.categories.length === 0) {
            this.state.categories = [
                { id: 'general', name: 'General Knowledge', icon: '🌍', color: '#6366f1', quizCount: 3 },
                { id: 'science', name: 'Science', icon: '🔬', color: '#10b981', quizCount: 2 },
                { id: 'history', name: 'History', icon: '📜', color: '#f59e0b', quizCount: 2 },
                { id: 'technology', name: 'Technology', icon: '💻', color: '#3b82f6', quizCount: 2 },
                { id: 'movies', name: 'Movies', icon: '🎬', color: '#ef4444', quizCount: 2 },
                { id: 'sports', name: 'Sports', icon: '⚽', color: '#8b5cf6', quizCount: 2 }
            ];
        }
    }

    get(path) {
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
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => callback(value));
        }
    }

    addQuizResult(quizId, score, points, timeTaken, answers) {
        const result = {
            quizId,
            score,
            points,
            timeTaken,
            answers,
            date: new Date().toISOString()
        };
        
        // Update user stats
        this.state.user.totalPoints += points;
        this.state.user.totalCorrect += answers.filter(a => a.isCorrect).length;
        this.state.user.totalQuizzes += 1;
        this.state.user.totalTime += timeTaken;
        
        // Add to leaderboard
        this.state.leaderboard.push({
            userId: 'current',
            name: this.state.user.name,
            score: points,
            quizId,
            date: new Date().toISOString()
        });
        
        this.sortLeaderboard();
        this.checkAchievements();
        this.notifyListeners('user', this.state.user);
        this.saveToStorage();
    }

    sortLeaderboard() {
        this.state.leaderboard.sort((a, b) => b.score - a.score);
        this.state.leaderboard = this.state.leaderboard.slice(0, 100);
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_quiz', name: 'First Steps', desc: 'Complete your first quiz', icon: '🎯', condition: () => this.state.user.totalQuizzes >= 1 },
            { id: 'perfect_score', name: 'Perfect!', desc: 'Get 100% on any quiz', icon: '⭐', condition: () => this.state.currentQuiz?.score === 100 },
            { id: 'quiz_master', name: 'Quiz Master', desc: 'Complete 10 quizzes', icon: '🏆', condition: () => this.state.user.totalQuizzes >= 10 },
            { id: 'time_keeper', name: 'Time Keeper', desc: 'Complete a quiz with no time left', icon: '⏰', condition: () => this.state.currentQuiz?.timeLeft === 0 },
            { id: 'points_collector', name: 'Points Collector', desc: 'Earn 1000 total points', icon: '💰', condition: () => this.state.user.totalPoints >= 1000 }
        ];
        
        achievements.forEach(ach => {
            if (!this.state.user.achievements.find(a => a.id === ach.id) && ach.condition()) {
                this.state.user.achievements.push({ ...ach, unlockedAt: new Date().toISOString() });
            }
        });
    }

    saveToStorage() {
        try {
            localStorage.setItem('quiz_app_state', JSON.stringify({
                user: this.state.user,
                leaderboard: this.state.leaderboard,
                settings: this.state.settings
            }));
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('quiz_app_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.user = { ...this.state.user, ...data.user };
                this.state.leaderboard = data.leaderboard || [];
                this.state.settings = { ...this.state.settings, ...data.settings };
            }
        } catch (error) {
            console.error('Error loading:', error);
        }
    }
}

window.StateManager = StateManager;