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
            if(response.ok) {
                const data = await response.json();
                if(data && data.data) {
                    this.stateManager.set('globalData', data.data);
                    this.updateGlobalStats(data.data);
                }
            }
        } catch(err) { console.error('Global data fetch error:', err); }
    }

    updateGlobalStats(data) {
        if(!data || !data.total_market_cap || !data.market_cap_percentage) return;
        const marketCapEl = document.getElementById('globalMarketCap');
        const volumeEl = document.getElementById('globalVolume');
        const dominanceEl = document.getElementById('btcDominance');
        if(marketCapEl && data.total_market_cap.usd) marketCapEl.textContent = `$${(data.total_market_cap.usd / 1e12).toFixed(2)}T`;
        if(volumeEl && data.total_volume.usd) volumeEl.textContent = `$${(data.total_volume.usd / 1e9).toFixed(2)}B`;
        if(dominanceEl && data.market_cap_percentage.btc) dominanceEl.textContent = `${data.market_cap_percentage.btc.toFixed(1)}%`;
    }

    updateMarketStats() {
        const coins = this.stateManager.get('coins');
        const container = document.getElementById('marketStats');
        if(!container || !coins || coins.length < 3) return;
        const top3 = coins.slice(0, 3);
        container.innerHTML = top3.map(coin => {
            if(!coin.current_price || typeof coin.current_price !== 'number') return '';
            const change = coin.price_change_percentage_24h || 0;
            return `
            <div class="market-stat-card">
                <i class="fas fa-chart-line"></i>
                <div class="stat-label">${coin.symbol.toUpperCase()}/USD</div>
                <div class="stat-value">$${coin.current_price.toLocaleString()}</div>
                <div class="stat-change ${change >= 0 ? 'positive' : 'negative'}">${change.toFixed(2)}%</div>
            </div>
        `;
        }).join('');
    }
}
window.MarketManager = MarketManager;