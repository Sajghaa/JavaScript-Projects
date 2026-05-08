class CryptoCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(coin, isActive = false) {
        const change = coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? coin.price_change_percentage_24h : 0;
        const price = coin.current_price !== null && coin.current_price !== undefined ? coin.current_price : 0;
        return `
            <div class="crypto-card ${isActive ? 'active' : ''}" data-id="${coin.id}">
                <div class="crypto-info">
                    <div class="crypto-rank">#${coin.market_cap_rank || 'N/A'}</div>
                    <div class="crypto-icon"><i class="fab fa-${this.getIcon(coin.symbol)}"></i></div>
                    <div>
                        <div class="crypto-name">${coin.name}</div>
                        <div class="crypto-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                </div>
                <div class="crypto-price">
                    <div class="crypto-price-value">$${price.toLocaleString()}</div>
                    <div class="crypto-change ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
                </div>
            </div>
        `;
    }

    getIcon(symbol) {
        const icons = { btc: 'bitcoin', eth: 'ethereum', sol: 'solana', xrp: 'xrp', doge: 'dogecoin', ada: 'cardano' };
        return icons[symbol] || 'bitcoin';
    }
}
window.CryptoCard = CryptoCard;