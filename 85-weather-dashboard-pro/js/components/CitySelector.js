class CitySelector {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.render();
    }

    render() {
        const container = document.getElementById('citiesList');
        const cities = this.stateManager.get('cities');
        const current = this.stateManager.get('currentCity');
        container.innerHTML = cities.map(city => `
            <div class="city-chip ${city === current ? 'active' : ''}" data-city="${city}">
                <i class="fas fa-city"></i> ${city}
                <button class="remove-city" data-city="${city}"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
        this.attachEvents();
    }

    attachEvents() {
        document.querySelectorAll('.city-chip').forEach(chip => {
            chip.onclick = (e) => { if(!e.target.closest('.remove-city')) this.eventBus.emit('city:select', chip.dataset.city); };
        });
        document.querySelectorAll('.remove-city').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.eventBus.emit('city:remove', btn.dataset.city); };
        });
    }
}
window.CitySelector = CitySelector;