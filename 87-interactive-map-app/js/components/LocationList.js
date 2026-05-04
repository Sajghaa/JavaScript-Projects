class LocationList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(locations) {
        if(locations.length === 0) return '<div class="empty-state">No locations saved. Click + to add one!</div>';
        const icons = { restaurant: '🍽️', cafe: '☕', park: '🌳', museum: '🏛️', hotel: '🏨', shop: '🛍️', other: '📍' };
        return locations.map(loc => `
            <div class="location-item" data-id="${loc.id}">
                <div class="location-name">
                    <span>${icons[loc.category]} ${this.escapeHtml(loc.name)}</span>
                    <small>${new Date(loc.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="location-category">${loc.category}</div>
                ${loc.address ? `<div class="location-address"><i class="fas fa-map-pin"></i> ${this.escapeHtml(loc.address)}</div>` : ''}
            </div>
        `).join('');
    }

    escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
}
window.LocationList = LocationList;