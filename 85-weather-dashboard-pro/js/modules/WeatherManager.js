class WeatherManager {
    constructor(stateManager, eventBus, apiManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.api = apiManager;
        this.weatherCard = new WeatherCard(stateManager, eventBus);
        this.forecastCard = new ForecastCard(stateManager, eventBus);
        this.tempChart = new TemperatureChart(stateManager, eventBus);
        this.weatherAnimation = new WeatherAnimation();
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadWeather();
        this.eventBus.on('city:select', (city) => { 
            this.stateManager.setCurrentCity(city); 
            this.loadWeather(); 
        });
        this.eventBus.on('city:add', (city) => { 
            if(this.stateManager.addCity(city)) this.loadWeather(); 
        });
        this.eventBus.on('city:remove', (city) => { 
            this.stateManager.removeCity(city); 
            this.loadWeather(); 
        });
        this.eventBus.on('units:changed', () => this.loadWeather());
        
        document.getElementById('refreshBtn').onclick = () => this.loadWeather();
        document.getElementById('unitsToggle').onclick = () => { 
            this.stateManager.toggleUnits(); 
            this.loadWeather(); 
        };
        document.getElementById('searchBtn').onclick = () => this.searchCity();
        document.getElementById('citySearch').onkeypress = (e) => { 
            if(e.key === 'Enter') this.searchCity(); 
        };
    }

    async loadWeather() {
        if(this.isLoading) return;
        
        const city = this.stateManager.get('currentCity');
        const units = this.stateManager.get('units');
        
        if(!city) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            console.log(`Loading weather for: ${city}`);
            const weather = await this.api.getCurrentWeather(city, units);
            const forecast = await this.api.getForecast(city, units);
            
            this.stateManager.set('weatherData', weather);
            this.stateManager.set('forecastData', forecast);
            
            this.renderCurrentWeather(weather);
            this.renderForecast(forecast);
            this.updateStats(weather);
            
            if(this.tempChart) this.tempChart.render(forecast);
            if(this.weatherAnimation) this.weatherAnimation.startAnimation(weather.weather[0].main);
            
            this.eventBus.emit('toast', { message: `Weather updated for ${city}`, type: 'success' });
        } catch(err) {
            console.error('Weather load error:', err);
            this.eventBus.emit('toast', { message: `Could not load weather for ${city}: ${err.message}`, type: 'error' });
            this.renderError(city);
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    renderCurrentWeather(data) {
        const container = document.getElementById('currentWeather');
        if(container) container.innerHTML = this.weatherCard.render(data);
    }

    renderForecast(data) {
        const container = document.getElementById('forecastGrid');
        if(container) container.innerHTML = data.map(f => this.forecastCard.render(f)).join('');
    }

    updateStats(data) {
        const elements = {
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            visibility: document.getElementById('visibility'),
            pressure: document.getElementById('pressure'),
            feelsLike: document.getElementById('feelsLike')
        };
        
        if(elements.humidity) elements.humidity.textContent = `${data.main.humidity}%`;
        if(elements.windSpeed) elements.windSpeed.textContent = `${Math.round(data.wind.speed)} ${this.stateManager.get('units') === 'metric' ? 'km/h' : 'mph'}`;
        if(elements.visibility) elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        if(elements.pressure) elements.pressure.textContent = `${data.main.pressure} hPa`;
        if(elements.feelsLike) elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}${this.stateManager.get('tempUnit')}`;
        
        // Update UV Index - Note: UV index requires separate API call, using placeholder
        const uvElement = document.getElementById('uvIndex');
        if(uvElement) uvElement.textContent = '5';
    }

    renderError(city) {
        const container = document.getElementById('currentWeather');
        if(container) {
            container.innerHTML = `
                <div class="weather-error" style="text-align:center; padding:2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:var(--danger);"></i>
                    <h3>Could not load weather for ${city}</h3>
                    <p>Please check the city name and try again.</p>
                </div>
            `;
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if(spinner) spinner.style.display = show ? 'block' : 'none';
    }

    async searchCity() {
        const query = document.getElementById('citySearch').value;
        if(!query) return;
        
        try {
            const results = await this.api.searchCity(query);
            const modal = document.getElementById('addCityModal');
            const resultsDiv = document.getElementById('searchResults');
            
            if(!resultsDiv) return;
            
            if(results.length === 0) {
                resultsDiv.innerHTML = '<div class="search-result-item">No cities found</div>';
            } else {
                resultsDiv.innerHTML = results.map(r => `
                    <div class="search-result-item" data-name="${r.name}" data-country="${r.country}">
                        ${r.name}, ${r.country}
                    </div>
                `).join('');
                
                resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
                    item.onclick = () => {
                        const cityName = item.dataset.name;
                        this.eventBus.emit('city:add', cityName);
                        modal.classList.remove('active');
                        document.getElementById('citySearch').value = '';
                    };
                });
            }
            
            modal.classList.add('active');
        } catch(err) {
            this.eventBus.emit('toast', { message: 'Search failed. Please try again.', type: 'error' });
        }
    }
}

window.WeatherManager = WeatherManager;