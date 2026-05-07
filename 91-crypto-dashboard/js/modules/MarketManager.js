class MarketManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.marketStats = new MarketStats(stateManager, eventBus);
        this.init();
    }

    async init() {
        await this.fetchGlobalData();
        this.eventBus.on('coins:updated', () => this.updateMarketStats());
    }

    async fetchGlobalData() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/global');
            const data = await response.json();
            this.stateManager.set('globalData', data.data);
            this.updateGlobalStats(data.data);
        } catch(err) { console.error(err); }
    }

    updateGlobalStats(data) {
        document.getElementById('globalMarketCap').textContent = `$${(data.total_market_cap.usd / 1e12).toFixed(2)}T`;
        document.getElementById('globalVolume').textContent = `$${(data.total_volume.usd / 1e9).toFixed(2)}B`;
        document.getElementById('btcDominance').textContent = `${data.market_cap_percentage.btc.toFixed(1)}%`;
    }

    updateMarketStats() {
        const coins = this.stateManager.get('coins');
        const container = document.getElementById('marketStats');
        const top3 = coins.slice(0, 3);
        container.innerHTML = top3.map(coin => `
            <div class="market-stat-card">
                <i class="fas fa-chart-line"></i>
                <div class="stat-label">${coin.symbol.toUpperCase()}/USD</div>
                <div class="stat-value">$${coin.current_price.toLocaleString()}</div>
                <div class="stat-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${coin.price_change_percentage_24h.toFixed(2)}%</div>
            </div>
        `).join('');
    }
}
window.MarketManager = MarketManager;