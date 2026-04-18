class AnalyticsManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.updateStats();
        
        this.eventBus.on('tasks:updated', () => this.updateStats());
    }

    updateStats() {
        const stats = this.stateManager.getStats();
        
        const totalEl = document.getElementById('totalTasks');
        const completedEl = document.getElementById('completedTasks');
        const pendingEl = document.getElementById('pendingTasks');
        const taskCountSpan = document.getElementById('taskCountNumber');
        
        if (totalEl) totalEl.textContent = stats.total;
        if (completedEl) completedEl.textContent = stats.completed;
        if (pendingEl) pendingEl.textContent = stats.pending;
        if (taskCountSpan) taskCountSpan.textContent = this.stateManager.getFilteredTasks().length;
    }
}

window.AnalyticsManager = AnalyticsManager;