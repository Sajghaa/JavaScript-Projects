// WebSocketSimulator.js - Simulates real-time data feed
class WebSocketSimulator {
    constructor(stateManager, eventBus, stockManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.stockManager = stockManager;
        this.interval = null;
        this.isRunning = false;
        
        this.init();
    }

    init() {
        const autoRefresh = this.stateManager.get('settings.autoRefresh');
        if (autoRefresh) {
            this.start();
        }
        
        document.getElementById('refreshBtn').onclick = () => {
            this.manualRefresh();
        };
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        
        const interval = this.stateManager.get('settings.refreshInterval');
        this.interval = setInterval(() => {
            this.updatePrices();
        }, interval);
        
        this.isRunning = true;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
    }

    updatePrices() {
        this.stockManager.updateStockPrices();
        this.eventBus.emit('prices:updated');
    }

    manualRefresh() {
        this.updatePrices();
        this.eventBus.emit('toast', { message: 'Prices refreshed manually', type: 'info' });
    }

    setRefreshInterval(intervalMs) {
        this.stateManager.set('settings.refreshInterval', intervalMs);
        if (this.isRunning) {
            this.start();
        }
    }
}

window.WebSocketSimulator = WebSocketSimulator;