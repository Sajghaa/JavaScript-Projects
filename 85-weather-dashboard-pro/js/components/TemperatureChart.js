class TemperatureChart {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.chart = null;
    }

    render(forecastData) {
        const days = forecastData.map(f => new Date(f.dt*1000).toLocaleDateString('en-US',{weekday:'short'}));
        const temps = forecastData.map(f => f.main.temp);
        const ctx = document.getElementById('tempChart').getContext('2d');
        if(this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'line',
            data: { labels: days, datasets: [{ label: 'Temperature', data: temps, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } }, scales: { y: { title: { display: true, text: this.stateManager.get('tempUnit') } } } }
        });
    }
}
window.TemperatureChart = TemperatureChart;