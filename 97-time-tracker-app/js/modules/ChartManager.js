// ChartManager.js - Manages charts and data visualization
class ChartManager {
    constructor(activityManager) {
        this.activityManager = activityManager;
        this.distributionChart = null;
        this.trendChart = null;
        this.init();
    }
    
    init() {
        this.updateCharts();
        
        this.activityManager.on('activitiesUpdated', () => this.updateCharts());
        this.activityManager.on('filterChanged', () => this.updateCharts());
    }
    
    updateCharts() {
        this.updateDistributionChart();
        this.updateTrendChart();
    }
    
    updateDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        const chartData = this.activityManager.getChartData();
        
        if (this.distributionChart) {
            this.distributionChart.destroy();
        }
        
        this.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.data,
                    backgroundColor: [
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#06b6d4', '#ec4899', '#6b7280'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 11 },
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} min (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    updateTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        const trendData = this.activityManager.getWeeklyTrend();
        
        if (this.trendChart) {
            this.trendChart.destroy();
        }
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Time Spent (minutes)',
                    data: trendData.data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: 'white'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw} minutes`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes',
                            font: { size: 11 }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day of Week',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

window.ChartManager = ChartManager;