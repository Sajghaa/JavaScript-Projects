class APIManager {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
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
        for(let i=0;i<data.list.length;i+=8) if(dailyForecasts.length<5) dailyForecasts.push(data.list[i]);
        return dailyForecasts;
    }

    async searchCity(query) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    }
}
window.APIManager = APIManager;