class LocationForm {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentEditId = null;
        this.init();
    }

    init() {
        document.getElementById('saveLocationBtn').onclick = () => this.saveLocation();
        document.getElementById('updateLocationBtn').onclick = () => this.updateLocation();
        document.getElementById('deleteLocationBtn').onclick = () => this.deleteLocation();
        document.getElementById('addLocationBtn').onclick = () => this.showAddModal();
    }

    showAddModal(lat=null, lng=null) {
        this.currentEditId = null;
        document.getElementById('locationForm').reset();
        if(lat && lng) { document.getElementById('locationLat').value = lat; document.getElementById('locationLng').value = lng; }
        document.getElementById('locationModal').classList.add('active');
    }

    showEditModal(location) {
        this.currentEditId = location.id;
        document.getElementById('editLocationId').value = location.id;
        document.getElementById('editLocationName').value = location.name;
        document.getElementById('editLocationCategory').value = location.category;
        document.getElementById('editLocationDescription').value = location.description || '';
        document.getElementById('editLocationAddress').value = location.address || '';
        document.getElementById('editLocationModal').classList.add('active');
    }

    saveLocation() {
        const name = document.getElementById('locationName').value;
        const lat = parseFloat(document.getElementById('locationLat').value);
        const lng = parseFloat(document.getElementById('locationLng').value);
        const category = document.getElementById('locationCategory').value;
        const address = document.getElementById('locationAddress').value;
        const description = document.getElementById('locationDescription').value;
        if(!name || isNaN(lat) || isNaN(lng) || !category) { this.eventBus.emit('toast', { message: 'Please fill all required fields', type: 'error' }); return; }
        this.eventBus.emit('location:add', { name, lat, lng, category, address, description });
        this.closeModal();
    }

    updateLocation() {
        const id = parseInt(document.getElementById('editLocationId').value);
        const name = document.getElementById('editLocationName').value;
        const category = document.getElementById('editLocationCategory').value;
        const address = document.getElementById('editLocationAddress').value;
        const description = document.getElementById('editLocationDescription').value;
        this.eventBus.emit('location:update', { id, name, category, address, description });
        this.closeModal();
    }

    deleteLocation() { if(confirm('Delete this location?')) this.eventBus.emit('location:delete', parseInt(document.getElementById('editLocationId').value)); this.closeModal(); }
    closeModal() { document.getElementById('locationModal').classList.remove('active'); document.getElementById('editLocationModal').classList.remove('active'); }
    setCoordinates(lat, lng) { document.getElementById('locationLat').value = lat; document.getElementById('locationLng').value = lng; }
}
window.LocationForm = LocationForm;