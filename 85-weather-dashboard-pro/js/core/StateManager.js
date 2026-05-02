class StateManager {
    constructor() {
        this.state = {
            cities: ['London', 'New York', 'Tokyo', 'Paris'],
            currentCity: 'London',
            weatherData: {},
            forecastData: {},
            units: 'metric',
            tempUnit: '°C'
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

    addCity(city) { if(!this.state.cities.includes(city)) { this.state.cities.push(city); this.notifyListeners('cities', this.state.cities); this.saveToStorage(); return true; } return false; }
    removeCity(city) { this.state.cities = this.state.cities.filter(c=>c!==city); if(this.state.currentCity===city) this.state.currentCity=this.state.cities[0]; this.notifyListeners('cities', this.state.cities); this.saveToStorage(); }
    setCurrentCity(city) { this.state.currentCity = city; this.notifyListeners('currentCity', city); this.saveToStorage(); }

    toggleUnits() { this.state.units = this.state.units === 'metric' ? 'imperial' : 'metric'; this.state.tempUnit = this.state.units === 'metric' ? '°C' : '°F'; this.notifyListeners('units', this.state.units); this.saveToStorage(); }

    saveToStorage() { try { localStorage.setItem('weather_state', JSON.stringify({ cities: this.state.cities, currentCity: this.state.currentCity, units: this.state.units })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('weather_state'); if(saved) { const data = JSON.parse(saved); this.state.cities = data.cities || this.state.cities; this.state.currentCity = data.currentCity || this.state.cities[0]; this.state.units = data.units || 'metric'; } } catch(e){} }
}
window.StateManager = StateManager;