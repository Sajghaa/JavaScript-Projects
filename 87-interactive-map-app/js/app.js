document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const locationForm = new LocationForm(stateManager, eventBus);
    const mapManager = new MapManager(stateManager, eventBus);
    const markerManager = new MarkerManager(stateManager, eventBus, locationForm);
    const locationManager = new LocationManager(stateManager, eventBus);
    const searchManager = new SearchManager(stateManager, eventBus);
    const geolocationManager = new GeolocationManager(stateManager, eventBus);
    const routePlanner = new RoutePlanner(stateManager, eventBus);
    
    window.app = { stateManager, eventBus, mapManager, markerManager, locationManager, routePlanner };
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
        };
    });
    
    eventBus.on('toast', ({message,type}) => { const toast = document.getElementById('toast'); toast.textContent = message; toast.className = `toast ${type} show`; setTimeout(()=>toast.classList.remove('show'), 3000); });
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    // Make map manager globally accessible for marker manager
    window.mapManager = mapManager;
    
    console.log('Interactive Map App Ready!');
});
window.closeModal = function() { document.querySelectorAll('.modal').forEach(m=>m.classList.remove('active')); };