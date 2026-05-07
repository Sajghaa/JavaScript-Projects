class StateManager {
    constructor() {
        this.state = {
            coins: [],
            selectedCoin: 'bitcoin',
            coinData: {},
            marketData: {},
            portfolio: [],
            news: [],
            globalData: {},
            favorites: []
        };
        this.listeners = new Map();
        this.loadFromStorage();
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    addToPortfolio(asset) { this.state.portfolio.push({ id: Date.now(), ...asset }); this.notifyListeners('portfolio', this.state.portfolio); this.saveToStorage(); }
    removeFromPortfolio(id) { this.state.portfolio = this.state.portfolio.filter(p=>p.id!==id); this.notifyListeners('portfolio', this.state.portfolio); this.saveToStorage(); }
    updatePortfolio() { this.notifyListeners('portfolio', this.state.portfolio); }

    toggleFavorite(id) { if(this.state.favorites.includes(id)) this.state.favorites = this.state.favorites.filter(f=>f!==id); else this.state.favorites.push(id); this.saveToStorage(); }

    saveToStorage() { try { localStorage.setItem('crypto_state', JSON.stringify({ portfolio: this.state.portfolio, favorites: this.state.favorites })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('crypto_state'); if(saved) { const data = JSON.parse(saved); this.state.portfolio = data.portfolio || []; this.state.favorites = data.favorites || []; } } catch(e){} }
}
window.StateManager = StateManager;