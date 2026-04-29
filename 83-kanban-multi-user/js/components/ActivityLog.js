class ActivityLog {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(activities) {
        if (!activities || activities.length === 0) {
            return '<div class="empty-state">No activity yet</div>';
        }
        
        return activities.map(activity => {
            const time = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = new Date(activity.timestamp).toLocaleDateString();
            
            return `
                <div class="activity-item">
                    <div class="activity-avatar" style="background: ${this.getAvatarColor(activity.userName)}">
                        ${activity.userName?.charAt(0) || 'U'}
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.message}</div>
                        <div class="activity-time">${date} at ${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getAvatarColor(name) {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const index = (name?.length || 0) % colors.length;
        return colors[index];
    }
}

window.ActivityLog = ActivityLog;