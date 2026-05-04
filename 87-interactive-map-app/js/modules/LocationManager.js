class LocationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.locationList = new LocationList(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderLocations();
        this.eventBus.on('locations:updated', () => this.renderLocations());
        this.updateStats();
    }

    renderLocations() {
        const container = document.getElementById('locationsList');
        const locations = this.stateManager.get('locations');
        document.getElementById('locationsCount').textContent = locations.length;
        container.innerHTML = this.locationList.render(locations);
        container.querySelectorAll('.location-item').forEach(item => { item.onclick = () => { const id = parseInt(item.dataset.id); const loc = this.stateManager.getLocation(id); if(loc) this.eventBus.emit('map:flyTo', [loc.lat, loc.lng], 15); }; });
    }

    updateStats() {
        const locations = this.stateManager.get('locations');
        const categories = new Set(locations.map(l => l.category));
        const recent = locations.filter(l => new Date(l.createdAt) > new Date(Date.now() - 7*86400000)).length;
        document.getElementById('statTotalLocations').textContent = locations.length;
        document.getElementById('statCategories').textContent = categories.size;
        document.getElementById('statRecent').textContent = recent;
        const catStats = {};
        locations.forEach(l => { catStats[l.category] = (catStats[l.category] || 0) + 1; });
        const icons = { restaurant: '🍽️', cafe: '☕', park: '🌳', museum: '🏛️', hotel: '🏨', shop: '🛍️', other: '📍' };
        document.getElementById('categoryStatsList').innerHTML = Object.entries(catStats).map(([cat,count]) => `<div class="category-stat-item"><span>${icons[cat]} ${cat}</span><span>${count}</span></div>`).join('');
    }
}
window.LocationManager = LocationManager;