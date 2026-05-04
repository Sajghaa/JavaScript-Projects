class MarkerManager {
    constructor(stateManager, eventBus, locationForm) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.locationForm = locationForm;
        this.map = null;
        this.markers = new Map();
        this.markerPopup = new MarkerPopup(stateManager, eventBus);
        this.init();
    }

    init() {
        this.eventBus.on('map:ready', (map) => { this.map = map; this.loadMarkers(); });
        this.eventBus.on('map:click', (latlng) => this.locationForm.showAddModal(latlng.lat, latlng.lng));
        this.eventBus.on('location:add', (loc) => this.addMarker(loc));
        this.eventBus.on('location:update', (data) => { this.stateManager.updateLocation(data.id, data); this.refreshMarkers(); });
        this.eventBus.on('location:delete', (id) => { this.stateManager.deleteLocation(id); this.removeMarker(id); });
        this.eventBus.on('locations:updated', () => this.refreshMarkers());
        setTimeout(() => this.eventBus.emit('map:ready', window.mapManager?.map), 500);
    }

    loadMarkers() { if(!this.map) return; this.stateManager.get('locations').forEach(loc => this.addMarkerToMap(loc)); }

    addMarker(location) { const newLoc = this.stateManager.addLocation(location); this.addMarkerToMap(newLoc); this.eventBus.emit('locations:updated'); this.eventBus.emit('toast', { message: 'Location added!', type: 'success' }); }

    addMarkerToMap(loc) { if(!this.map) return; const icon = L.divIcon({ className: 'custom-marker', html: this.getIcon(loc.category), iconSize: [30,30], popupAnchor: [0,-15] }); const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(this.map); marker.bindPopup(this.markerPopup.render(loc)); this.markers.set(loc.id, marker); }

    refreshMarkers() { this.markers.forEach(m => this.map.removeLayer(m)); this.markers.clear(); this.loadMarkers(); }

    removeMarker(id) { const marker = this.markers.get(id); if(marker) { this.map.removeLayer(marker); this.markers.delete(id); } this.eventBus.emit('locations:updated'); this.eventBus.emit('toast', { message: 'Location deleted', type: 'info' }); }

    editLocation(id) { const loc = this.stateManager.getLocation(id); if(loc) this.locationForm.showEditModal(loc); }

    deleteLocation(id) { if(confirm('Delete this location?')) this.eventBus.emit('location:delete', id); }

    getIcon(category) { const icons = { restaurant: '🍽️', cafe: '☕', park: '🌳', museum: '🏛️', hotel: '🏨', shop: '🛍️', other: '📍' }; return icons[category] || '📍'; }
}
window.MarkerManager = MarkerManager;