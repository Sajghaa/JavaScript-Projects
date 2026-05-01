class NotificationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.eventBus.on('toast', ({message,type}) => this.showToast(message,type));
    }
    showToast(msg, type='info') { const toast = document.getElementById('toast'); toast.textContent = msg; toast.className = `toast ${type} show`; setTimeout(()=>toast.classList.remove('show'), 3000); }
}
window.NotificationManager = NotificationManager;