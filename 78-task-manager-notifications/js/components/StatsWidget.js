// StatsWidget.js - Renders statistics widget
class StatsWidget {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.init();
    }

    init() {
        this.updateStats();
        this.eventBus.on('tasks:updated', () => this.updateStats());
    }

    updateStats() {
        const stats = this.getStats();
        
        // Update stat displays
        this.updateStat('totalTasks', stats.total);
        this.updateStat('completedTasks', stats.completed);
        this.updateStat('pendingTasks', stats.pending);
        
        // Update additional stats if elements exist
        this.updateStat('highPriorityTasks', stats.highPriority);
        this.updateStat('overdueTasks', stats.overdue);
        this.updateStat('completionRate', `${stats.completionRate}%`);
        
        // Update progress bar if exists
        this.updateProgressBar(stats.completionRate);
    }

    getStats() {
        const tasks = this.stateManager.get('tasks');
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
        const overdue = tasks.filter(t => 
            t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
        ).length;
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        return {
            total,
            completed,
            pending,
            highPriority,
            overdue,
            completionRate
        };
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateProgressBar(percentage) {
        const progressBar = document.getElementById('completionProgress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
        
        const progressText = document.getElementById('completionText');
        if (progressText) {
            progressText.textContent = `${percentage}% Complete`;
        }
    }

    renderStatsCards() {
        const stats = this.getStats();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">Total Tasks</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.completed}</span>
                        <span class="stat-label">Completed</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-hourglass-half"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.pending}</span>
                        <span class="stat-label">Pending</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.highPriority}</span>
                        <span class="stat-label">High Priority</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <span class="stat-value">${stats.overdue}</span>
                        <span class="stat-label">Overdue</span>
                    </div>
                </div>
                <div class="stat-card wide">
                    <div class="stat-progress">
                        <div class="progress-label">Completion Rate</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${stats.completionRate}%"></div>
                        </div>
                        <div class="progress-value">${stats.completionRate}%</div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.StatsWidget = StatsWidget;