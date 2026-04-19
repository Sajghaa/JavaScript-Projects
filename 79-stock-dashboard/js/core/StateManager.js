class StateManager {
    constructor() {
        this.state = {
            stocks: [],
            portfolio: [],
            alerts: [],
            news: [],
            marketData: {
                marketCap: 0,
                totalVolume: 0,
                totalChange: 0
            },
            settings: {
                autoRefresh: true,
                refreshInterval: 5000,
                theme: 'light',
                viewMode: 'grid'
            },
            chartPeriod: '1D',
            lastUpdate: new Date()
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
        this.initializeSampleData();
    }

    initializeSampleData() {
        if (this.state.stocks.length === 0) {
            this.state.stocks = [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.5, changePercent: 1.45, volume: 52400000, high: 176.20, low: 173.80, marketCap: 2750000000000 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.75, change: -1.2, changePercent: -0.86, volume: 18900000, high: 140.10, low: 138.20, marketCap: 1750000000000 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.25, change: 3.8, changePercent: 1.02, volume: 22100000, high: 379.50, low: 374.80, marketCap: 2810000000000 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.80, change: -0.5, changePercent: -0.34, volume: 31200000, high: 147.20, low: 145.30, marketCap: 1510000000000 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.60, change: 5.2, changePercent: 2.16, volume: 98700000, high: 248.50, low: 240.30, marketCap: 780000000000 },
                { symbol: 'META', name: 'Meta Platforms', price: 312.50, change: -2.1, changePercent: -0.67, volume: 15600000, high: 315.80, low: 311.20, marketCap: 802000000000 },
                { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 795.30, change: 12.5, changePercent: 1.60, volume: 33400000, high: 798.60, low: 785.20, marketCap: 1960000000000 },
                { symbol: 'JPM', name: 'JPMorgan Chase', price: 168.90, change: 1.2, changePercent: 0.72, volume: 12300000, high: 169.80, low: 167.50, marketCap: 492000000000 }
            ];
        }
        
        if (this.state.news.length === 0) {
            this.state.news = [
                { title: "Fed signals rate cuts coming this year", time: "2 hours ago", source: "Reuters" },
                { title: "Tech stocks rally on AI optimism", time: "3 hours ago", source: "Bloomberg" },
                { title: "Apple announces new product launch event", time: "5 hours ago", source: "CNBC" },
                { title: "Market reaches new all-time high", time: "6 hours ago", source: "WSJ" },
                { title: "Oil prices drop on supply concerns", time: "8 hours ago", source: "FT" }
            ];
        }
        
        this.updateMarketStats();
    }

    get(path) {
        if (!path) return this.state;
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        const oldValue = target[lastKey];
        
        target[lastKey] = value;
        this.notifyListeners(path, value, oldValue);
        this.saveToStorage();
        
        const event = new CustomEvent('stateChanged', { detail: { path, value } });
        document.dispatchEvent(event);
    }

    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        return () => this.listeners.get(path)?.delete(callback);
    }

    notifyListeners(path, value, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => callback(value, oldValue));
        }
    }

    updateStock(symbol, updates) {
        const index = this.state.stocks.findIndex(s => s.symbol === symbol);
        if (index !== -1) {
            this.state.stocks[index] = { ...this.state.stocks[index], ...updates };
            this.notifyListeners('stocks', this.state.stocks);
            this.updateMarketStats();
            this.saveToStorage();
            return true;
        }
        return false;
    }

    updateMarketStats() {
        const stocks = this.state.stocks;
        const totalChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
        const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
        const marketCap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
        
        this.state.marketData = { marketCap, totalVolume, totalChange };
        this.notifyListeners('marketData', this.state.marketData);
    }

    getStock(symbol) {
        return this.state.stocks.find(s => s.symbol === symbol);
    }

    addToPortfolio(item) {
        const existing = this.state.portfolio.find(p => p.symbol === item.symbol);
        if (existing) {
            existing.shares += item.shares;
            existing.totalValue = existing.shares * existing.avgPrice;
        } else {
            this.state.portfolio.push({ ...item, id: Date.now().toString() });
        }
        this.notifyListeners('portfolio', this.state.portfolio);
        this.saveToStorage();
    }

    removeFromPortfolio(symbol) {
        this.state.portfolio = this.state.portfolio.filter(p => p.symbol !== symbol);
        this.notifyListeners('portfolio', this.state.portfolio);
        this.saveToStorage();
    }

    addAlert(alert) {
        const newAlert = { ...alert, id: Date.now().toString(), triggered: false };
        this.state.alerts.push(newAlert);
        this.notifyListeners('alerts', this.state.alerts);
        this.saveToStorage();
        return newAlert;
    }

    removeAlert(alertId) {
        this.state.alerts = this.state.alerts.filter(a => a.id !== alertId);
        this.notifyListeners('alerts', this.state.alerts);
        this.saveToStorage();
    }

    checkAlerts() {
        this.state.alerts.forEach(alert => {
            const stock = this.getStock(alert.symbol);
            if (stock && !alert.triggered) {
                const triggered = alert.condition === 'above' ? 
                    stock.price >= alert.price : stock.price <= alert.price;
                
                if (triggered) {
                    alert.triggered = true;
                    this.notifyListeners('alert:triggered', alert);
                }
            }
        });
        this.notifyListeners('alerts', this.state.alerts);
    }

    saveToStorage() {
        try {
            localStorage.setItem('stock_dashboard_state', JSON.stringify({
                portfolio: this.state.portfolio,
                alerts: this.state.alerts,
                settings: this.state.settings
            }));
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('stock_dashboard_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.portfolio = data.portfolio || [];
                this.state.alerts = data.alerts || [];
                this.state.settings = { ...this.state.settings, ...data.settings };
            }
        } catch (error) {
            console.error('Error loading:', error);
        }
    }
}

window.StateManager = StateManager;