class NotificationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('toast', ({ message, type }) => this.showToast(message, type));
        this.eventBus.on('message:sent', (message) => {
            const currentUser = this.stateManager.get('currentUser');
            if (message.userId !== currentUser?.id) {
                this.showNotification(message);
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    showNotification(message) {
        if (Notification.permission === 'granted') {
            const user = this.stateManager.get('users').find(u => u.id === message.userId);
            new Notification(`${user?.name} sent a message`, { body: message.text });
        }
    }
}

window.NotificationManager = NotificationManager;