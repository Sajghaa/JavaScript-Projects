class PortfolioManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.portfolioWidget = new PortfolioWidget(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderPortfolio();
        this.eventBus.on('portfolio:updated', () => this.renderPortfolio());
        document.getElementById('portfolioBtn').onclick = () => this.showModal();
        document.getElementById('addAssetBtn').onclick = () => this.addAsset();
        this.populateAssetSelect();
    }

    renderPortfolio() {
        const container = document.getElementById('portfolioList');
        if(!container) return;
        const portfolio = this.stateManager.get('portfolio');
        const coins = this.stateManager.get('coins');
        
        if(!portfolio || portfolio.length === 0) { container.innerHTML = '<div class="empty-state">No assets yet</div>'; return; }
        
        container.innerHTML = portfolio.map(asset => {
            const coin = coins.find(c => c.id === asset.coinId);
            if(!coin) return '';
            const currentPrice = coin.current_price || 0;
            const value = currentPrice * asset.amount;
            const buyValue = asset.buyPrice * asset.amount;
            const pnl = value - buyValue;
            const pnlPercent = buyValue ? (pnl / buyValue) * 100 : 0;
            return `
                <div class="portfolio-item">
                    <div class="portfolio-item-info">
                        <div class="portfolio-item-symbol">${asset.coinId.toUpperCase()}</div>
                        <div class="portfolio-item-amount">${asset.amount} coins @ $${asset.buyPrice}</div>
                    </div>
                    <div class="portfolio-item-value">
                        <div class="portfolio-item-price">$${value.toFixed(2)}</div>
                        <div class="portfolio-item-pnl ${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)</div>
                    </div>
                    <button class="remove-asset" data-id="${asset.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }).join('');
        
        this.updateTotal();
        document.querySelectorAll('.remove-asset').forEach(btn => { btn.onclick = () => this.removeAsset(parseInt(btn.dataset.id)); });
    }

    updateTotal() {
        const portfolio = this.stateManager.get('portfolio');
        const coins = this.stateManager.get('coins');
        let total = 0;
        let totalPnL = 0;
        portfolio.forEach(asset => {
            const coin = coins.find(c => c.id === asset.coinId);
            if(coin) {
                const currentValue = coin.current_price * asset.amount;
                const buyValue = asset.buyPrice * asset.amount;
                total += currentValue;
                totalPnL += currentValue - buyValue;
            }
        });
        document.getElementById('portfolioTotal').textContent = `$${total.toFixed(2)}`;
        const pnlEl = document.getElementById('portfolioChange');
        if(pnlEl) pnlEl.textContent = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`;
    }

    addAsset() {
        const assetSelect = document.getElementById('assetSelect');
        const assetAmount = document.getElementById('assetAmount');
        const assetPrice = document.getElementById('assetPrice');
        if(!assetSelect || !assetAmount || !assetPrice) { this.eventBus.emit('toast', { message: 'Form elements not found', type: 'error' }); return; }
        
        const coinId = assetSelect.value;
        const amount = parseFloat(assetAmount.value);
        const buyPrice = parseFloat(assetPrice.value);
        if(!coinId || !amount || !buyPrice || isNaN(amount) || isNaN(buyPrice)) { this.eventBus.emit('toast', { message: 'Fill all fields with valid numbers', type: 'error' }); return; }
        this.stateManager.addToPortfolio({ coinId, amount, buyPrice });
        this.eventBus.emit('portfolio:updated', this.stateManager.get('portfolio'));
        this.renderPortfolio();
        this.eventBus.emit('toast', { message: 'Asset added', type: 'success' });
        assetAmount.value = '';
        assetPrice.value = '';
    }

    removeAsset(id) { this.stateManager.removeFromPortfolio(id); this.eventBus.emit('portfolio:updated', this.stateManager.get('portfolio')); this.renderPortfolio(); }

    populateAssetSelect() {
        const coins = this.stateManager.get('coins');
        const select = document.getElementById('assetSelect');
        if(!select || !coins) return;
        select.innerHTML = '<option value="">Select Coin</option>' + coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol.toUpperCase()})</option>`).join('');
    }

    showModal() { 
        const modal = document.getElementById('portfolioModal');
        if(modal) { 
            modal.classList.add('active');
            this.populateAssetSelect(); 
            this.renderPortfolio(); 
        } 
    }
}
window.PortfolioManager = PortfolioManager;