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
        const portfolio = this.stateManager.get('portfolio');
        const coins = this.stateManager.get('coins');
        
        if(portfolio.length === 0) { container.innerHTML = '<div class="empty-state">No assets yet</div>'; return; }
        
        container.innerHTML = portfolio.map(asset => {
            const coin = coins.find(c => c.id === asset.coinId);
            const currentPrice = coin?.current_price || 0;
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
        portfolio.forEach(asset => {
            const coin = coins.find(c => c.id === asset.coinId);
            if(coin) total += coin.current_price * asset.amount;
        });
        document.getElementById('portfolioTotal').textContent = `$${total.toFixed(2)}`;
    }

    addAsset() {
        const coinId = document.getElementById('assetSelect').value;
        const amount = parseFloat(document.getElementById('assetAmount').value);
        const buyPrice = parseFloat(document.getElementById('assetPrice').value);
        if(!coinId || !amount || !buyPrice) { this.eventBus.emit('toast', { message: 'Fill all fields', type: 'error' }); return; }
        this.stateManager.addToPortfolio({ coinId, amount, buyPrice });
        this.renderPortfolio();
        this.eventBus.emit('toast', { message: 'Asset added', type: 'success' });
        document.getElementById('assetAmount').value = '';
        document.getElementById('assetPrice').value = '';
    }

    removeAsset(id) { this.stateManager.removeFromPortfolio(id); this.renderPortfolio(); }

    populateAssetSelect() {
        const coins = this.stateManager.get('coins');
        const select = document.getElementById('assetSelect');
        select.innerHTML = '<option value="">Select Coin</option>' + coins.map(c => `<option value="${c.id}">${c.name} (${c.symbol.toUpperCase()})</option>`).join('');
    }

    showModal() { document.getElementById('portfolioModal').classList.add('active'); this.populateAssetSelect(); this.renderPortfolio(); }
}
window.PortfolioManager = PortfolioManager;