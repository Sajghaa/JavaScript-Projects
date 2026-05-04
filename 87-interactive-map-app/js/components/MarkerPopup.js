class MarkerPopup {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(location) {
        const icons = { restaurant: '🍽️', cafe: '☕', park: '🌳', museum: '🏛️', hotel: '🏨', shop: '🛍️', other: '📍' };
        return `
            <div style="min-width: 200px;">
                <h4 style="margin:0 0 5px; color:var(--primary);">${icons[location.category]} ${this.escapeHtml(location.name)}</h4>
                <p style="margin:5px 0; font-size:12px;">${location.address || 'No address'}</p>
                <p style="margin:5px 0; font-size:12px;">${location.description || ''}</p>
                <div style="display:flex; gap:8px; margin-top:10px;">
                    <button onclick="app.markerManager.editLocation(${location.id})" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="app.markerManager.deleteLocation(${location.id})" class="btn btn-danger btn-sm">Delete</button>
                    <button onclick="app.routePlanner.setAsPoint(${location.id}, 'start')" class="btn btn-primary btn-sm">Route from here</button>
                </div>
            </div>
        `;
    }
    escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
}
window.MarkerPopup = MarkerPopup;