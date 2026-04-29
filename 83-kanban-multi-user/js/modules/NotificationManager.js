class NotificationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('toast', ({ message, type }) => this.showToast(message, type));
        this.eventBus.on('task:create', () => this.showToast('Task created!', 'success'));
        this.eventBus.on('task:update', () => this.showToast('Task updated!', 'success'));
        this.eventBus.on('task:delete', () => this.showToast('Task deleted', 'info'));
        
        // Simulate user activity
        setInterval(() => this.simulateUserActivity(), 30000);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    simulateUserActivity() {
        const users = this.stateManager.get('users');
        const currentUser = this.stateManager.getCurrentUser();
        const otherUsers = users.filter(u => u.id !== currentUser?.id);
        
        if (otherUsers.length > 0 && Math.random() > 0.7) {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            this.stateManager.toggleActiveUser(randomUser.id, true);
            setTimeout(() => {
                this.stateManager.toggleActiveUser(randomUser.id, false);
            }, 10000);
        }
    }
}

window.NotificationManager = NotificationManager;