class ExpenseChart {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.categoryChart = null;
        this.trendChart = null;
    }

    renderCategoryChart(expenses) {
        const categoryTotals = {};
        expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const ctx = document.getElementById('categoryChart').getContext('2d');
        if(this.categoryChart) this.categoryChart.destroy();
        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#6b7280'] }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    renderTrendChart(expenses) {
        const dailyTotals = {};
        expenses.forEach(e => { dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount; });
        const sortedDates = Object.keys(dailyTotals).sort();
        const data = sortedDates.map(d => dailyTotals[d]);
        const ctx = document.getElementById('trendChart').getContext('2d');
        if(this.trendChart) this.trendChart.destroy();
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: { labels: sortedDates, datasets: [{ label: 'Daily Spending', data, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Amount ($)' } } } }
        });
    }
}
window.ExpenseChart = ExpenseChart;