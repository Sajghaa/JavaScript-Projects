class WeatherCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(data) {
        const tempUnit = this.stateManager.get('tempUnit');
        const icon = this.getWeatherIcon(data.weather[0].main);
        return `
            <div class="weather-main">
                <div class="weather-temp">
                    <div class="temp">${Math.round(data.main.temp)}${tempUnit}</div>
                    <div class="weather-desc">${data.weather[0].description}</div>
                </div>
                <div class="weather-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="weather-details">
                    <div class="detail-item"><i class="fas fa-tint"></i><div>${data.main.humidity}%</div><small>Humidity</small></div>
                    <div class="detail-item"><i class="fas fa-wind"></i><div>${Math.round(data.wind.speed)} ${this.stateManager.get('units')==='metric'?'km/h':'mph'}</div><small>Wind</small></div>
                    <div class="detail-item"><i class="fas fa-sun"></i><div>${this.getSunTime(data.sys.sunrise)}</div><small>Sunrise</small></div>
                    <div class="detail-item"><i class="fas fa-moon"></i><div>${this.getSunTime(data.sys.sunset)}</div><small>Sunset</small></div>
                </div>
            </div>
        `;
    }

    getWeatherIcon(condition) {
        const icons = { Clear: 'fas fa-sun', Clouds: 'fas fa-cloud-sun', Rain: 'fas fa-cloud-rain', Snow: 'fas fa-snowflake', Thunderstorm: 'fas fa-bolt', Drizzle: 'fas fa-cloud-rain', Mist: 'fas fa-smog' };
        return icons[condition] || 'fas fa-cloud-sun';
    }

    getSunTime(timestamp) { return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
}
window.WeatherCard = WeatherCard;