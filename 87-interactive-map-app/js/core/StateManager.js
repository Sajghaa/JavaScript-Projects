class StateManager {
    constructor() {
        this.state = {
            locations: [],
            mapCenter: [51.505, -0.09],
            mapZoom: 13,
            selectedLocation: null,
            route: null,
            categories: ['restaurant', 'cafe', 'park', 'museum', 'hotel', 'shop', 'other']
        };
        this.listeners = new Map();
        this.loadFromStorage();
        this.initSampleLocations();
    }

    initSampleLocations() {
        if(this.state.locations.length === 0) {
            this.state.locations = [
                { id: 1, name: 'Central Park', lat: 40.785091, lng: -73.968285, category: 'park', address: 'New York, NY', description: 'Beautiful urban park', icon: '🌳', createdAt: new Date().toISOString() },
                { id: 2, name: 'The Met', lat: 40.779436, lng: -73.963244, category: 'museum', address: '1000 5th Ave, New York', description: 'World-famous art museum', icon: '🏛️', createdAt: new Date().toISOString() },
                { id: 3, name: 'Starbucks', lat: 40.758896, lng: -73.985119, category: 'cafe', address: 'Times Square, NYC', description: 'Coffee shop', icon: '☕', createdAt: new Date().toISOString() }
            ];
            this.saveToStorage();
        }
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

    addLocation(loc) { const newLoc = { id: Date.now(), createdAt: new Date().toISOString(), ...loc }; this.state.locations.push(newLoc); this.notifyListeners('locations', this.state.locations); this.saveToStorage(); return newLoc; }
    updateLocation(id, updates) { const idx = this.state.locations.findIndex(l=>l.id===id); if(idx!==-1) { this.state.locations[idx] = {...this.state.locations[idx], ...updates}; this.notifyListeners('locations', this.state.locations); this.saveToStorage(); return true; } return false; }
    deleteLocation(id) { this.state.locations = this.state.locations.filter(l=>l.id!==id); this.notifyListeners('locations', this.state.locations); this.saveToStorage(); }
    getLocation(id) { return this.state.locations.find(l=>l.id===id); }

    saveToStorage() { try { localStorage.setItem('map_state', JSON.stringify({ locations: this.state.locations })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('map_state'); if(saved) { const data = JSON.parse(saved); this.state.locations = data.locations || []; } } catch(e){} }
}
window.StateManager = StateManager;