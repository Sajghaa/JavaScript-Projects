class ForecastCard {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(forecast) {
        const tempUnit = this.stateManager.get('tempUnit');
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = this.getWeatherIcon(forecast.weather[0].main);
        return `
            <div class="forecast-card">
                <div class="forecast-day">${day}</div>
                <div class="forecast-icon"><i class="${icon}"></i></div>
                <div class="forecast-temp">${Math.round(forecast.main.temp)}${tempUnit}</div>
                <div class="forecast-desc">${forecast.weather[0].description}</div>
            </div>
        `;
    }

    getWeatherIcon(condition) {
        const icons = { Clear: 'fas fa-sun', Clouds: 'fas fa-cloud-sun', Rain: 'fas fa-cloud-rain', Snow: 'fas fa-snowflake', Thunderstorm: 'fas fa-bolt' };
        return icons[condition] || 'fas fa-cloud-sun';
    }
}
window.ForecastCard = ForecastCard;