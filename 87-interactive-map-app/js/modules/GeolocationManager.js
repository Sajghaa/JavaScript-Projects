class GeolocationManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        document.getElementById('myLocationBtn').onclick = () => this.getUserLocation();
    }

    getUserLocation() {
        if('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(pos => { this.eventBus.emit('map:flyTo', [pos.coords.latitude, pos.coords.longitude], 15); this.eventBus.emit('toast', { message: '📍 Your location found!', type: 'success' }); }, 
            () => this.eventBus.emit('toast', { message: 'Unable to get location', type: 'error' }));
        } else this.eventBus.emit('toast', { message: 'Geolocation not supported', type: 'error' });
    }
}
window.GeolocationManager = GeolocationManager;