// Leaderboard.js - Renders leaderboard with rankings
class Leaderboard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentCategory = 'all';
        this.currentPeriod = 'all';
    }

    render(entries, currentUserId = null) {
        if (!entries || entries.length === 0) {
            return this.renderEmpty();
        }
        
        return `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <div class="header-left">
                        <i class="fas fa-trophy"></i>
                        <h3>Global Rankings</h3>
                    </div>
                    <div class="header-right">
                        <span class="total-players">
                            <i class="fas fa-users"></i> ${entries.length} players
                        </span>
                    </div>
                </div>
                
                <div class="leaderboard-list">
                    ${entries.map((entry, index) => this.renderEntry(entry, index + 1, currentUserId)).join('')}
                </div>
                
                <div class="leaderboard-footer">
                    <div class="legend">
                        <span><i class="fas fa-trophy" style="color: #fbbf24;"></i> Top 3</span>
                        <span><i class="fas fa-medal"></i> Your Rank</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEntry(entry, rank, currentUserId) {
        const isTop3 = rank <= 3;
        const isCurrentUser = currentUserId === entry.userId;
        const rankClass = this.getRankClass(rank);
        
        return `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}" data-user-id="${entry.userId}">
                <div class="leaderboard-rank ${rankClass}">
                    ${rank <= 3 ? this.getRankIcon(rank) : rank}
                </div>
                <div class="leaderboard-avatar">
                    <div class="avatar-icon" style="background: ${this.getAvatarColor(entry.name)}">
                        ${entry.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">
                        ${entry.name}
                        ${entry.isPro ? '<i class="fas fa-check-circle verified" title="Pro Member"></i>' : ''}
                    </div>
                    <div class="leaderboard-stats">
                        <span><i class="fas fa-trophy"></i> ${entry.quizzesCompleted || 1} quizzes</span>
                        <span><i class="fas fa-star"></i> ${entry.avgScore || Math.floor(Math.random() * 30) + 70}% avg</span>
                    </div>
                </div>
                <div class="leaderboard-score">
                    <div class="score-value">${entry.score}</div>
                    <div class="score-label">points</div>
                </div>
                ${isTop3 ? `<div class="leaderboard-badge">${this.getBadgeText(rank)}</div>` : ''}
            </div>
        `;
    }

    renderEmpty() {
        return `
            <div class="leaderboard-empty">
                <i class="fas fa-chart-line"></i>
                <h3>No scores yet</h3>
                <p>Be the first to complete a quiz and appear on the leaderboard!</p>
                <button class="btn btn-primary" onclick="app.navigateTo('home')">
                    <i class="fas fa-play"></i> Take a Quiz
                </button>
            </div>
        `;
    }

    getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        return '';
    }

    getRankIcon(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    }

    getBadgeText(rank) {
        if (rank === 1) return 'CHAMPION';
        if (rank === 2) return 'RUNNER UP';
        if (rank === 3) return 'BRONZE';
        return '';
    }

    getAvatarColor(name) {
        const colors = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7'
        ];
        const index = name.length % colors.length;
        return colors[index];
    }

    filterByCategory(entries, category) {
        if (category === 'all') return entries;
        return entries.filter(entry => entry.quizId === category);
    }

    filterByPeriod(entries, period) {
        if (period === 'all') return entries;
        
        const now = new Date();
        const cutoff = new Date();
        
        if (period === 'week') {
            cutoff.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            cutoff.setMonth(now.getMonth() - 1);
        }
        
        return entries.filter(entry => new Date(entry.date) >= cutoff);
    }

    getTopPerformers(entries, limit = 10) {
        return entries.slice(0, limit);
    }

    getUserRank(entries, userId) {
        const index = entries.findIndex(e => e.userId === userId);
        return index !== -1 ? index + 1 : null;
    }

    renderLeaderboardCard(entries, title) {
        return `
            <div class="leaderboard-card">
                <div class="card-header">
                    <h4>${title}</h4>
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="card-body">
                    ${entries.slice(0, 5).map((entry, i) => `
                        <div class="mini-leaderboard-item">
                            <span class="rank">${i + 1}</span>
                            <span class="name">${entry.name}</span>
                            <span class="score">${entry.score}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachEvents(element) {
        // Handle click on leaderboard items
        const items = element.querySelectorAll('.leaderboard-item');
        items.forEach(item => {
            item.onclick = () => {
                const userId = item.dataset.userId;
                this.eventBus.emit('leaderboard:select', userId);
            };
        });
    }
}

window.Leaderboard = Leaderboard;