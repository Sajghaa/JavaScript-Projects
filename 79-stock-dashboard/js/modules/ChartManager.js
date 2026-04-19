class ChartManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.chart = null;
        this.currentPeriod = '1D';
        
        this.init();
    }

    init() {
        this.setupChartControls();
        this.createChart();
    }

    setupChartControls() {
        const timeBtns = document.querySelectorAll('.time-btn');
        timeBtns.forEach(btn => {
            btn.onclick = () => {
                timeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateChartData();
            };
        });
    }

    createChart() {
        const ctx = document.getElementById('marketChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLabels(),
                datasets: [{
                    label: 'Market Index',
                    data: this.generateData(),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `$${context.raw.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { callback: (value) => `$${value}` }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    }

    getLabels() {
        const periods = {
            '1D': Array.from({ length: 24 }, (_, i) => `${i}:00`),
            '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            '1M': Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
            '3M': Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
            '1Y': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
        return periods[this.currentPeriod] || periods['1D'];
    }

    generateData() {
        const basePrice = 100;
        const volatility = 5;
        const data = [];
        
        for (let i = 0; i < this.getLabels().length; i++) {
            const change = (Math.random() - 0.5) * volatility;
            const price = basePrice + change * Math.sqrt(i + 1);
            data.push(parseFloat(price.toFixed(2)));
        }
        
        return data;
    }

    updateChartData() {
        if (this.chart) {
            this.chart.data.labels = this.getLabels();
            this.chart.data.datasets[0].data = this.generateData();
            this.chart.update();
        }
    }
}

window.ChartManager = ChartManager;