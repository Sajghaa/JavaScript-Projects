document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const apiManager = new APIManager();
    const weatherManager = new WeatherManager(stateManager, eventBus, apiManager);
    const cityManager = new CityManager(stateManager, eventBus);
    
    window.app = { stateManager, eventBus, weatherManager, cityManager };
    
    eventBus.on('toast', ({message,type}) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(()=>toast.classList.remove('show'), 3000);
    });
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    const unitsIcon = document.getElementById('unitsToggle');
    const updateUnitsIcon = () => { unitsIcon.innerHTML = `<i class="fas fa-thermometer-half"></i> ${stateManager.get('tempUnit')}`; };
    stateManager.subscribe('units', updateUnitsIcon);
    updateUnitsIcon();
    
    console.log('Weather Dashboard Pro Ready!');
});

window.closeModal = function() { document.getElementById('addCityModal').classList.remove('active'); };