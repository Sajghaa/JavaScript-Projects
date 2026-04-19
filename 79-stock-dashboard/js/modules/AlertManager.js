// AlertManager.js - Manages price alerts
class AlertManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        
        this.init();
    }

    init() {
        this.renderAlerts();
        
        document.getElementById('setAlertBtn').onclick = () => {
            this.showSetAlertModal();
        };
        
        this.eventBus.on('alert:show', (symbol) => {
            this.showSetAlertModal(symbol);
        });
        
        this.eventBus.on('alert:triggered', (alert) => {
            this.showAlertNotification(alert);
        });
    }

    renderAlerts() {
        const container = document.getElementById('alertsList');
        const alerts = this.stateManager.get('alerts');
        
        container.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-info">
                    <div class="alert-symbol">${alert.symbol}</div>
                    <div class="alert-condition">${alert.condition} $${alert.price}</div>
                    ${alert.triggered ? '<div class="alert-triggered">✓ Triggered</div>' : ''}
                </div>
                <button class="remove-alert" data-id="${alert.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        document.querySelectorAll('.remove-alert').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.id;
                this.removeAlert(id);
            };
        });
    }

    showSetAlertModal(symbol = null) {
        const modal = document.getElementById('alertModal');
        const stockSelect = document.getElementById('alertStock');
        
        const stocks = this.stateManager.get('stocks');
        stockSelect.innerHTML = '<option value="">Choose a stock...</option>' +
            stocks.map(s => `<option value="${s.symbol}" ${symbol === s.symbol ? 'selected' : ''}>${s.symbol} - $${s.price}</option>`).join('');
        
        document.getElementById('alertPrice').value = '';
        document.getElementById('alertCondition').value = 'above';
        
        modal.classList.add('active');
        
        document.getElementById('saveAlertBtn').onclick = () => {
            this.addAlert();
        };
    }

    addAlert() {
        const symbol = document.getElementById('alertStock').value;
        const price = parseFloat(document.getElementById('alertPrice').value);
        const condition = document.getElementById('alertCondition').value;
        
        if (!symbol || !price) {
            this.eventBus.emit('toast', { message: 'Please fill all fields', type: 'error' });
            return;
        }
        
        this.stateManager.addAlert({ symbol, price, condition });
        this.renderAlerts();
        this.closeModal();
        this.eventBus.emit('toast', { message: `Alert set for ${symbol} at $${price}`, type: 'success' });
    }

    removeAlert(id) {
        this.stateManager.removeAlert(id);
        this.renderAlerts();
        this.eventBus.emit('toast', { message: 'Alert removed', type: 'info' });
    }

    showAlertNotification(alert) {
        const stock = this.stateManager.getStock(alert.symbol);
        if (stock) {
            const message = `${alert.symbol} ${alert.condition} $${alert.price}. Current price: $${stock.price}`;
            
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Price Alert!', { body: message, icon: 'https://via.placeholder.com/64' });
            }
            
            this.eventBus.emit('toast', { message, type: 'warning' });
        }
    }

    closeModal() {
        document.getElementById('alertModal').classList.remove('active');
    }
}

window.AlertManager = AlertManager;