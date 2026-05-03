class WeatherManager {
    constructor(stateManager, eventBus, apiManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.api = apiManager;
        this.weatherCard = new WeatherCard(stateManager, eventBus);
        this.forecastCard = new ForecastCard(stateManager, eventBus);
        this.tempChart = new TemperatureChart(stateManager, eventBus);
        this.weatherAnimation = new WeatherAnimation();
        this.init();
    }

    init() {
        this.loadWeather();
        this.eventBus.on('city:select', (city) => { this.stateManager.setCurrentCity(city); this.loadWeather(); });
        this.eventBus.on('city:add', (city) => { if(this.stateManager.addCity(city)) this.loadWeather(); });
        this.eventBus.on('city:remove', (city) => { this.stateManager.removeCity(city); this.loadWeather(); });
        this.eventBus.on('units:changed', () => this.loadWeather());
        document.getElementById('refreshBtn').onclick = () => this.loadWeather();
        document.getElementById('unitsToggle').onclick = () => { this.stateManager.toggleUnits(); this.loadWeather(); };
        document.getElementById('searchBtn').onclick = () => this.searchCity();
        document.getElementById('citySearch').onkeypress = (e) => { if(e.key==='Enter') this.searchCity(); };
    }

    async loadWeather() {
        const city = this.stateManager.get('currentCity');
        const units = this.stateManager.get('units');
        try {
            const weather = await this.api.getCurrentWeather(city, units);
            const forecast = await this.api.getForecast(city, units);
            this.stateManager.set('weatherData', weather);
            this.stateManager.set('forecastData', forecast);
            this.renderCurrentWeather(weather);
            this.renderForecast(forecast);
            this.updateStats(weather);
            this.tempChart.render(forecast);
            this.weatherAnimation.startAnimation(weather.weather[0].main);
            this.eventBus.emit('toast', { message: `Weather updated for ${city}`, type: 'success' });
        } catch(err) { this.eventBus.emit('toast', { message: err.message, type: 'error' }); }
    }

    renderCurrentWeather(data) {
        document.getElementById('currentWeather').innerHTML = this.weatherCard.render(data);
    }

    renderForecast(data) {
        document.getElementById('forecastGrid').innerHTML = data.map(f => this.forecastCard.render(f)).join('');
    }

    updateStats(data) {
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed)} ${this.stateManager.get('units')==='metric'?'km/h':'mph'}`;
        document.getElementById('visibility').textContent = `${data.visibility/1000} km`;
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}${this.stateManager.get('tempUnit')}`;
    }

    async searchCity() {
        const query = document.getElementById('citySearch').value;
        if(!query) return;
        try {
            const results = await this.api.searchCity(query);
            const modal = document.getElementById('addCityModal');
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = results.map(r => `<div class="search-result-item" data-name="${r.name}">${r.name}, ${r.country}</div>`).join('');
            resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                item.onclick = () => { this.eventBus.emit('city:add', item.dataset.name); modal.classList.remove('active'); document.getElementById('citySearch').value = ''; };
            });
            modal.classList.add('active');
        } catch(err) { this.eventBus.emit('toast', { message: 'Search failed', type: 'error' }); }
    }
}
window.WeatherManager = WeatherManager;