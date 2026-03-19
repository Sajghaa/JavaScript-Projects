export class Toast {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.timeout = null;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('toast');
        
        // Clear any existing timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        // Set toast content and type
        toast.innerHTML = this.render(message, type);
        toast.className = `toast ${type} show`;
        
        // Auto hide after duration
        this.timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    render(message, type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        return `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
    }

    hide() {
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
        
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
}