// app.js - Main application
document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const toast = new NotificationToast();
    
    const stockManager = new StockManager(stateManager, eventBus);
    const chartManager = new ChartManager(stateManager, eventBus);
    const portfolioManager = new PortfolioManager(stateManager, eventBus);
    const alertManager = new AlertManager(stateManager, eventBus);
    const webSocketSimulator = new WebSocketSimulator(stateManager, eventBus, stockManager);
    const newsTicker = new NewsTicker(stateManager, eventBus);
    
    window.app = {
        stateManager,
        eventBus,
        stockManager,
        chartManager,
        portfolioManager,
        alertManager,
        webSocketSimulator,
        newsTicker
    };
    
    // Initial render
    stockManager.renderStocks();
    
    // Update market stats display
    const updateStats = () => {
        const marketData = stateManager.get('marketData');
        document.getElementById('marketCap').textContent = `$${(marketData.marketCap / 1e12).toFixed(2)}T`;
        document.getElementById('totalVolume').textContent = (marketData.totalVolume / 1e6).toFixed(0) + 'M';
        document.getElementById('totalChange').innerHTML = `${marketData.totalChange >= 0 ? '+' : ''}${marketData.totalChange.toFixed(2)}%`;
        document.getElementById('totalChange').style.color = marketData.totalChange >= 0 ? 'var(--success)' : 'var(--danger)';
    };
    
    stateManager.subscribe('marketData', updateStats);
    updateStats();
    
    // View mode toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            const view = btn.dataset.view;
            stateManager.set('settings.viewMode', view);
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            stockManager.renderStocks();
        };
    });
    
    // Settings button
    document.getElementById('settingsBtn').onclick = () => {
        const autoRefresh = stateManager.get('settings.autoRefresh');
        const interval = stateManager.get('settings.refreshInterval');
        
        const newAutoRefresh = confirm('Enable auto-refresh? (Currently: ' + (autoRefresh ? 'ON' : 'OFF') + ')');
        if (newAutoRefresh !== autoRefresh) {
            stateManager.set('settings.autoRefresh', newAutoRefresh);
            if (newAutoRefresh) {
                webSocketSimulator.start();
                toast.show('Auto-refresh enabled', 'info');
            } else {
                webSocketSimulator.stop();
                toast.show('Auto-refresh disabled', 'info');
            }
        }
    };
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Event listeners
    eventBus.on('prices:updated', () => {
        portfolioManager.updateTotal();
    });
    
    eventBus.on('toast', ({ message, type }) => {
        toast.show(message, type);
    });
    
    eventBus.on('portfolio:add', (symbol) => {
        portfolioManager.showAddToPortfolioModal(symbol);
    });
    
    console.log('Stock Dashboard Initialized!');
});

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
}

// Attach close modal handlers
document.addEventListener('DOMContentLoaded', function() {
    // Close modals via X button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            closeModal();
        };
    });
    
    // Close modals via ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });
});

class NotificationToast {
    constructor() {
        this.toastElement = document.getElementById('toast');
    }

    show(message, type = 'success', duration = 3000) {
        if (!this.toastElement) return;
        
        this.toastElement.textContent = message;
        this.toastElement.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toastElement.classList.remove('show');
        }, duration);
    }
}

window.closeModal = closeModal;
window.NotificationToast = NotificationToast;