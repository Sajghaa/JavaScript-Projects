class ResultCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(results) {
        const scorePercent = results.score;
        const performanceLevel = this.getPerformanceLevel(scorePercent);
        const feedback = this.getFeedback(scorePercent);
        
        return `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-icon ${performanceLevel}">
                        <i class="fas ${this.getResultIcon(scorePercent)}"></i>
                    </div>
                    <h2>${feedback.title}</h2>
                    <p>${feedback.message}</p>
                </div>
                
                <div class="result-stats">
                    <div class="stat-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" class="stat-circle-bg"/>
                            <circle cx="50" cy="50" r="45" class="stat-circle-fill" 
                                    style="stroke-dasharray: ${scorePercent * 2.83}, 283"/>
                        </svg>
                        <div class="stat-circle-value">
                            <span class="score">${scorePercent}</span>
                            <span class="percent">%</span>
                        </div>
                    </div>
                    
                    <div class="stat-details">
                        <div class="stat-item">
                            <i class="fas fa-check-circle success"></i>
                            <div>
                                <span class="stat-label">Correct</span>
                                <span class="stat-value">${results.correct}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-times-circle danger"></i>
                            <div>
                                <span class="stat-label">Incorrect</span>
                                <span class="stat-value">${results.total - results.correct}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-star warning"></i>
                            <div>
                                <span class="stat-label">Points Earned</span>
                                <span class="stat-value">${results.points}</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock info"></i>
                            <div>
                                <span class="stat-label">Time Taken</span>
                                <span class="stat-value">${this.formatTime(results.timeTaken)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="result-achievements">
                    <h4><i class="fas fa-medal"></i> Achievements Unlocked</h4>
                    <div class="achievements-list" id="resultAchievements">
                        ${this.renderAchievements(results)}
                    </div>
                </div>
                
                <div class="result-breakdown">
                    <h4><i class="fas fa-chart-bar"></i> Performance Breakdown</h4>
                    <div class="breakdown-chart">
                        ${this.renderBreakdown(results.answers)}
                    </div>
                </div>
            </div>
        `;
    }

    getPerformanceLevel(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'average';
        return 'poor';
    }

    getResultIcon(score) {
        if (score >= 90) return 'fa-crown';
        if (score >= 70) return 'fa-smile-wink';
        if (score >= 50) return 'fa-meh';
        return 'fa-frown';
    }

    getFeedback(score) {
        if (score >= 90) {
            return {
                title: 'Outstanding!',
                message: 'You\'re a true quiz master! Keep up the amazing work!'
            };
        }
        if (score >= 70) {
            return {
                title: 'Great Job!',
                message: 'Good knowledge! A little more practice and you\'ll be perfect!'
            };
        }
        if (score >= 50) {
            return {
                title: 'Not Bad!',
                message: 'Room for improvement. Review the answers and try again!'
            };
        }
        return {
            title: 'Keep Learning!',
            message: 'Don\'t give up! Review the correct answers and try the quiz again.'
        };
    }

    renderAchievements(results) {
        const achievements = this.getUnlockedAchievements(results);
        if (achievements.length === 0) {
            return '<div class="no-achievements">Complete more quizzes to unlock achievements!</div>';
        }
        
        return achievements.map(ach => `
            <div class="achievement-badge">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            </div>
        `).join('');
    }

    getUnlockedAchievements(results) {
        const achievements = [];
        
        if (results.score === 100) {
            achievements.push({
                icon: '⭐',
                name: 'Perfect Score!',
                desc: 'Got 100% on a quiz'
            });
        }
        
        if (results.correct === results.total) {
            achievements.push({
                icon: '🏆',
                name: 'Flawless Victory',
                desc: 'Answered all questions correctly'
            });
        }
        
        if (results.timeTaken < 60) {
            achievements.push({
                icon: '⚡',
                name: 'Speed Demon',
                desc: 'Completed quiz in under 1 minute'
            });
        }
        
        if (results.points >= 100) {
            achievements.push({
                icon: '💰',
                name: 'Point Collector',
                desc: 'Earned 100+ points in a single quiz'
            });
        }
        
        return achievements;
    }

    renderBreakdown(answers) {
        const categories = this.getCategoryBreakdown(answers);
        
        return `
            <div class="breakdown-bars">
                ${categories.map(cat => `
                    <div class="breakdown-item">
                        <div class="breakdown-label">${cat.name}</div>
                        <div class="breakdown-bar">
                            <div class="breakdown-fill" style="width: ${cat.percentage}%"></div>
                        </div>
                        <div class="breakdown-value">${cat.correct}/${cat.total}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getCategoryBreakdown(answers) {
        // Group answers by category (simplified for demo)
        const categories = [
            { name: 'Easy Questions', correct: 0, total: 0 },
            { name: 'Medium Questions', correct: 0, total: 0 },
            { name: 'Hard Questions', correct: 0, total: 0 }
        ];
        
        answers.forEach((answer, index) => {
            const category = index % 3;
            categories[category].total++;
            if (answer.isCorrect) categories[category].correct++;
        });
        
        return categories.map(cat => ({
            ...cat,
            percentage: cat.total ? (cat.correct / cat.total) * 100 : 0
        }));
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs} seconds`;
        return `${mins}m ${secs}s`;
    }
}

window.ResultCard = ResultCard;