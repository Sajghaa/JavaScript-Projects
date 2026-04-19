class StockManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.stockCard = new StockCard(stateManager, eventBus);
    }

    renderStocks() {
        const container = document.getElementById('stocksGrid');
        const stocks = this.stateManager.get('stocks');
        const viewMode = this.stateManager.get('settings.viewMode');
        
        container.className = `stocks-grid ${viewMode === 'list' ? 'list-view' : ''}`;
        container.innerHTML = stocks.map(stock => this.stockCard.render(stock)).join('');
        
        // Attach event listeners
        container.querySelectorAll('.stock-action-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const symbol = btn.dataset.symbol;
                const action = btn.dataset.action;
                
                if (action === 'buy') {
                    this.eventBus.emit('portfolio:add', symbol);
                } else if (action === 'alert') {
                    this.eventBus.emit('alert:show', symbol);
                }
            };
        });
        
        container.querySelectorAll('.stock-card').forEach(card => {
            card.onclick = () => {
                const symbol = card.dataset.symbol;
                this.eventBus.emit('stock:select', symbol);
            };
        });
    }

    updateStockPrices() {
        const stocks = this.stateManager.get('stocks');
        stocks.forEach(stock => {
            const volatility = stock.price * 0.02;
            const change = (Math.random() - 0.5) * volatility * 2;
            const newPrice = stock.price + change;
            const changePercent = (change / stock.price) * 100;
            
            this.stateManager.updateStock(stock.symbol, {
                price: parseFloat(newPrice.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2))
            });
        });
        
        this.stateManager.checkAlerts();
        this.renderStocks();
        this.updateTime();
    }

    updateTime() {
        const timeElement = document.getElementById('updateTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = `Last update: ${now.toLocaleTimeString()}`;
        }
    }

    getPortfolioValue() {
        const portfolio = this.stateManager.get('portfolio');
        let total = 0;
        
        portfolio.forEach(item => {
            const stock = this.stateManager.getStock(item.symbol);
            if (stock) {
                total += stock.price * item.shares;
            }
        });
        
        return total;
    }
}

window.StockManager = StockManager;