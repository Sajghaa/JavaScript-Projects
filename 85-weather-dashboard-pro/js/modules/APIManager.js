class APIManager {
    constructor() {
        this.apiKey = '2c0db66e7c222ed6110c31f3db429d00'; // Your API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getCurrentWeather(city, units = 'metric') {
        const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${this.apiKey}`;
        const response = await fetch(url);
        if(!response.ok) throw new Error('City not found');
        return await response.json();
    }

    async getForecast(city, units = 'metric') {
        const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)}&units=${units}&appid=${this.apiKey}`;
        const response = await fetch(url);
        if(!response.ok) throw new Error('City not found');
        const data = await response.json();
        const dailyForecasts = [];
        for(let i=0;i<data.list.length;i+=8) {
            if(dailyForecasts.length < 5) dailyForecasts.push(data.list[i]);
        }
        return dailyForecasts;
    }

    async searchCity(query) {
        // Using OpenWeatherMap's geocoding API
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.map(city => ({ name: city.name, country: city.country, lat: city.lat, lon: city.lon }));
    }
}
window.APIManager = APIManager;