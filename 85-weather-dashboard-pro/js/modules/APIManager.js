class APIManager {
    constructor() {
        this.apiKey = '2c0db66e7c222ed6110c31f3db429d00';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getCurrentWeather(city, units = 'metric') {
        try {
            // Encode the city name properly
            const encodedCity = encodeURIComponent(city.trim());
            const url = `${this.baseUrl}/weather?q=${encodedCity}&units=${units}&appid=${this.apiKey}`;
            console.log('Fetching weather from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.message || 'City not found');
            }
            
            const data = await response.json();
            console.log('Weather data received:', data);
            return data;
        } catch (error) {
            console.error('Weather fetch error:', error);
            throw error;
        }
    }

    async getForecast(city, units = 'metric') {
        try {
            const encodedCity = encodeURIComponent(city.trim());
            const url = `${this.baseUrl}/forecast?q=${encodedCity}&units=${units}&appid=${this.apiKey}`;
            console.log('Fetching forecast from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Forecast API Error:', errorData);
                throw new Error(errorData.message || 'City not found');
            }
            
            const data = await response.json();
            console.log('Forecast data received:', data);
            
            // Get unique days (every 8th entry is roughly 24 hours apart)
            const dailyForecasts = [];
            const seenDates = new Set();
            
            for (let i = 0; i < data.list.length; i++) {
                const date = data.list[i].dt_txt.split(' ')[0];
                if (!seenDates.has(date) && dailyForecasts.length < 5) {
                    seenDates.add(date);
                    dailyForecasts.push(data.list[i]);
                }
            }
            
            return dailyForecasts;
        } catch (error) {
            console.error('Forecast fetch error:', error);
            throw error;
        }
    }

    async searchCity(query) {
        try {
            const encodedQuery = encodeURIComponent(query.trim());
            // Using OpenWeatherMap's geocoding API
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodedQuery}&limit=5&appid=${this.apiKey}`;
            console.log('Searching city from:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            console.log('Search results:', data);
            
            return data.map(city => ({
                name: city.name,
                country: city.country,
                lat: city.lat,
                lon: city.lon,
                fullName: `${city.name}, ${city.country}`
            }));
        } catch (error) {
            console.error('City search error:', error);
            throw error;
        }
    }
}

window.APIManager = APIManager;