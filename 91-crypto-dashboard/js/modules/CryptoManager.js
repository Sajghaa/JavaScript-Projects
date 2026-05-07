class CryptoManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.cryptoCard = new CryptoCard(stateManager, eventBus);
        this.init();
    }

    async init() {
        await this.fetchCoins();
        await this.fetchSelectedCoinData();
        this.startAutoRefresh();
        this.eventBus.on('crypto:select', (id) => this.selectCoin(id));
        document.getElementById('refreshBtn').onclick = () => this.refresh();
    }

    async fetchCoins() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false');
            const data = await response.json();
            this.stateManager.set('coins', data);
            this.renderCoins();
            this.eventBus.emit('coins:updated', data);
        } catch(err) { console.error(err); }
    }

    async fetchSelectedCoinData() {
        const coin = this.stateManager.get('selectedCoin');
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`);
            const data = await response.json();
            this.stateManager.set('coinData', data);
            this.eventBus.emit('coinData:updated', data);
        } catch(err) { console.error(err); }
    }

    renderCoins() {
        const container = document.getElementById('cryptoList');
        const coins = this.stateManager.get('coins');
        const selectedCoin = this.stateManager.get('selectedCoin');
        container.innerHTML = coins.map(coin => this.cryptoCard.render(coin, coin.id === selectedCoin)).join('');
        this.attachEvents();
    }

    attachEvents() {
        document.querySelectorAll('.crypto-card').forEach(card => {
            card.onclick = () => {
                const id = card.dataset.id;
                this.eventBus.emit('crypto:select', id);
            };
        });
    }

    selectCoin(id) {
        this.stateManager.set('selectedCoin', id);
        this.fetchSelectedCoinData();
        this.renderCoins();
    }

    async refresh() {
        await this.fetchCoins();
        await this.fetchSelectedCoinData();
        this.eventBus.emit('toast', { message: 'Data refreshed!', type: 'success' });
    }

    startAutoRefresh() { setInterval(() => this.refresh(), 60000); }
}
window.CryptoManager = CryptoManager;