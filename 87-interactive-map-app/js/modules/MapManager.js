class MapManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.map = null;
        this.init();
    }

    init() {
        this.map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB', subdomains: 'abcd', maxZoom: 19 }).addTo(this.map);
        this.map.on('click', (e) => this.eventBus.emit('map:click', e.latlng));
        this.eventBus.on('map:flyTo', (center, zoom) => this.map.flyTo(center, zoom));
        this.eventBus.on('route:draw', (route) => this.drawRoute(route));
        this.eventBus.on('route:clear', () => this.clearRoute());
    }

    drawRoute(route) { if(this.routeLayer) this.map.removeLayer(this.routeLayer); this.routeLayer = L.polyline(route, { color: '#3b82f6', weight: 4, opacity: 0.7 }).addTo(this.map); this.map.fitBounds(this.routeLayer.getBounds()); }
    clearRoute() { if(this.routeLayer) { this.map.removeLayer(this.routeLayer); this.routeLayer = null; } }
    getMap() { return this.map; }
}
window.MapManager = MapManager;