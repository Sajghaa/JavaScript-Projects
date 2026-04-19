// PortfolioManager.js - Manages portfolio
class PortfolioManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.portfolioWidget = new PortfolioWidget(stateManager, eventBus);
        
        this.init();
    }

    init() {
        this.renderPortfolio();
        
        document.getElementById('addToPortfolioBtn').onclick = () => {
            this.showAddToPortfolioModal();
        };
        
        this.eventBus.on('portfolio:add', (symbol) => {
            this.showAddToPortfolioModal(symbol);
        });
    }

    renderPortfolio() {
        const container = document.getElementById('portfolioList');
        const portfolio = this.stateManager.get('portfolio');
        const stocks = this.stateManager.get('stocks');
        
        container.innerHTML = portfolio.map(item => {
            const stock = stocks.find(s => s.symbol === item.symbol);
            const currentValue = stock ? stock.price * item.shares : 0;
            const purchaseValue = item.avgPrice * item.shares;
            const profit = currentValue - purchaseValue;
            const profitPercent = purchaseValue ? (profit / purchaseValue) * 100 : 0;
            
            return `
                <div class="portfolio-item">
                    <div class="portfolio-item-info">
                        <div class="portfolio-item-symbol">${item.symbol}</div>
                        <div class="portfolio-item-shares">${item.shares} shares @ $${item.avgPrice}</div>
                    </div>
                    <div class="portfolio-item-value">
                        <div class="portfolio-item-price">$${currentValue.toFixed(2)}</div>
                        <div class="portfolio-item-change ${profit >= 0 ? 'positive' : 'negative'}">
                            ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)
                        </div>
                    </div>
                    <button class="remove-portfolio" data-symbol="${item.symbol}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        this.updateTotal();
        this.attachRemoveEvents();
    }

    attachRemoveEvents() {
        document.querySelectorAll('.remove-portfolio').forEach(btn => {
            btn.onclick = () => {
                const symbol = btn.dataset.symbol;
                this.removeFromPortfolio(symbol);
            };
        });
    }

    updateTotal() {
        const portfolio = this.stateManager.get('portfolio');
        const stocks = this.stateManager.get('stocks');
        let total = 0;
        
        portfolio.forEach(item => {
            const stock = stocks.find(s => s.symbol === item.symbol);
            if (stock) {
                total += stock.price * item.shares;
            }
        });
        
        const totalElement = document.getElementById('portfolioTotal');
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
        
        const portfolioValueElement = document.getElementById('portfolioValue');
        if (portfolioValueElement) {
            portfolioValueElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    showAddToPortfolioModal(symbol = null) {
        const modal = document.getElementById('portfolioModal');
        const stockSelect = document.getElementById('portfolioStock');
        const priceInput = document.getElementById('portfolioPrice');
        
        // Populate stock options
        const stocks = this.stateManager.get('stocks');
        stockSelect.innerHTML = '<option value="">Choose a stock...</option>' +
            stocks.map(s => `<option value="${s.symbol}" ${symbol === s.symbol ? 'selected' : ''}>${s.symbol} - ${s.name}</option>`).join('');
        
        const updatePrice = () => {
            const selectedSymbol = stockSelect.value;
            const selectedStock = stocks.find(s => s.symbol === selectedSymbol);
            if (selectedStock) {
                priceInput.value = selectedStock.price.toFixed(2);
            } else {
                priceInput.value = '';
            }
        };
        
        stockSelect.onchange = updatePrice;
        
        if (symbol) {
            stockSelect.value = symbol;
            updatePrice();
        } else {
            priceInput.value = '';
        }
        
        document.getElementById('portfolioShares').value = 1;
        
        modal.classList.add('active');
        
        document.getElementById('savePortfolioBtn').onclick = () => {
            this.addToPortfolio();
        };
    }

    addToPortfolio() {
        const symbol = document.getElementById('portfolioStock').value;
        const shares = parseInt(document.getElementById('portfolioShares').value);
        const price = parseFloat(document.getElementById('portfolioPrice').value);
        
        if (!symbol || !shares || !price) {
            this.eventBus.emit('toast', { message: 'Please fill all fields', type: 'error' });
            return;
        }
        
        this.stateManager.addToPortfolio({
            symbol: symbol,
            shares: shares,
            avgPrice: price
        });
        
        this.renderPortfolio();
        this.closeModal();
        this.eventBus.emit('toast', { message: `Added ${shares} shares of ${symbol} to portfolio`, type: 'success' });
    }

    removeFromPortfolio(symbol) {
        if (confirm(`Remove ${symbol} from portfolio?`)) {
            this.stateManager.removeFromPortfolio(symbol);
            this.renderPortfolio();
            this.eventBus.emit('toast', { message: `Removed ${symbol} from portfolio`, type: 'info' });
        }
    }

    closeModal() {
        document.getElementById('portfolioModal').classList.remove('active');
    }
}

window.PortfolioManager = PortfolioManager;