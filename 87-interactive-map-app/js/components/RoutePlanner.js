class RoutePlanner {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.startPoint = null;
        this.endPoint = null;
        this.currentRoute = null;
        this.init();
    }

    init() {
        document.getElementById('calculateRouteBtn').onclick = () => this.calculateRoute();
        document.getElementById('clearRouteBtn').onclick = () => this.clearRoute();
        this.eventBus.on('locations:updated', () => this.updateSelects());
    }

    updateSelects() {
        const locations = this.stateManager.get('locations');
        const startSelect = document.getElementById('startPoint');
        const endSelect = document.getElementById('endPoint');
        const options = '<option value="">Select location</option>' + locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
        startSelect.innerHTML = options;
        endSelect.innerHTML = options;
        startSelect.onchange = () => this.setPoint(parseInt(startSelect.value), 'start');
        endSelect.onchange = () => this.setPoint(parseInt(endSelect.value), 'end');
    }

    setPoint(id, type) { const loc = this.stateManager.getLocation(id); if(loc) { if(type === 'start') this.startPoint = loc; else this.endPoint = loc; } }

    setAsPoint(id, type) { const loc = this.stateManager.getLocation(id); if(loc) { if(type === 'start') { this.startPoint = loc; document.getElementById('startPoint').value = id; } else { this.endPoint = loc; document.getElementById('endPoint').value = id; } this.calculateRoute(); } }

    async calculateRoute() {
        if(!this.startPoint || !this.endPoint) { this.eventBus.emit('toast', { message: 'Select both start and end points', type: 'error' }); return; }
        try {
            const url = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${this.startPoint.lng},${this.startPoint.lat};${this.endPoint.lng},${this.endPoint.lat}?geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            if(data.routes && data.routes[0]) {
                this.currentRoute = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                this.eventBus.emit('route:draw', this.currentRoute);
                const distance = (data.routes[0].distance / 1000).toFixed(1);
                const duration = Math.round(data.routes[0].duration / 60);
                document.getElementById('routeInfo').innerHTML = `<strong>Distance:</strong> ${distance} km<br><strong>Duration:</strong> ~${duration} mins`;
                document.getElementById('routeInfo').classList.add('show');
                document.getElementById('clearRouteBtn').style.display = 'block';
                this.eventBus.emit('toast', { message: `Route calculated: ${distance} km, ${duration} mins`, type: 'success' });
            }
        } catch(err) { this.eventBus.emit('toast', { message: 'Route calculation failed', type: 'error' }); }
    }

    clearRoute() { this.startPoint = null; this.endPoint = null; this.currentRoute = null; document.getElementById('startPoint').value = ''; document.getElementById('endPoint').value = ''; document.getElementById('routeInfo').classList.remove('show'); document.getElementById('clearRouteBtn').style.display = 'none'; this.eventBus.emit('route:clear'); this.eventBus.emit('toast', { message: 'Route cleared', type: 'info' }); }
}
window.RoutePlanner = RoutePlanner;