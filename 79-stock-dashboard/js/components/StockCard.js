// StockCard.js - Renders individual stock card
class StockCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(stock) {
        const changeClass = stock.change >= 0 ? 'positive' : 'negative';
        const changeIcon = stock.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="stock-card" data-symbol="${stock.symbol}">
                <div class="stock-header">
                    <div class="stock-info">
                        <h4>${stock.symbol}</h4>
                        <div class="stock-symbol">${stock.name}</div>
                    </div>
                    <div class="stock-price">
                        <div class="current-price">$${stock.price.toFixed(2)}</div>
                        <div class="price-change ${changeClass}">
                            <i class="fas ${changeIcon}"></i>
                            ${stock.change >= 0 ? '+' : ''}$${Math.abs(stock.change).toFixed(2)} (${stock.changePercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
                <div class="stock-details">
                    <div class="detail-item">
                        <div class="detail-label">Volume</div>
                        <div class="detail-value">${this.formatNumber(stock.volume)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Day Range</div>
                        <div class="detail-value">$${stock.low} - $${stock.high}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Market Cap</div>
                        <div class="detail-value">$${this.formatNumber(stock.marketCap, true)}</div>
                    </div>
                </div>
                <div class="stock-actions">
                    <button class="stock-action-btn" data-symbol="${stock.symbol}" data-action="buy">
                        <i class="fas fa-shopping-cart"></i> Buy
                    </button>
                    <button class="stock-action-btn" data-symbol="${stock.symbol}" data-action="alert">
                        <i class="fas fa-bell"></i> Alert
                    </button>
                </div>
            </div>
        `;
    }

    formatNumber(num, isCurrency = false) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        return num.toLocaleString();
    }
}

window.StockCard = StockCard;