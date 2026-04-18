class NotificationToast {
    constructor() {
        this.toastElement = null;
        this.timeout = null;
        this.init();
    }

    init() {
        this.toastElement = document.getElementById('toast');
        if (!this.toastElement) {
            this.toastElement = document.createElement('div');
            this.toastElement.id = 'toast';
            this.toastElement.className = 'toast';
            document.body.appendChild(this.toastElement);
        }
    }

    show(message, type = 'success', duration = 3000) {
        if (this.timeout) clearTimeout(this.timeout);
        
        this.toastElement.textContent = message;
        this.toastElement.className = `toast ${type} show`;
        
        this.timeout = setTimeout(() => {
            this.toastElement.classList.remove('show');
        }, duration);
    }

    success(message, duration = 3000) { this.show(message, 'success', duration); }
    error(message, duration = 4000) { this.show(message, 'error', duration); }
    warning(message, duration = 3500) { this.show(message, 'warning', duration); }
    info(message, duration = 3000) { this.show(message, 'info', duration); }
}

window.NotificationToast = NotificationToast;