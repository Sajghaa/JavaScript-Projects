class AnalyticsManager {
    constructor(stateManager, eventBus, expenseChart, categorySummary) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.expenseChart = expenseChart;
        this.categorySummary = categorySummary;
        this.init();
    }

    init() {
        this.updateAnalytics();
        this.eventBus.on('expenses:refresh', () => this.updateAnalytics());
        this.eventBus.on('filters:changed', () => this.updateAnalytics());
    }

    updateAnalytics() {
        const expenses = this.stateManager.getFilteredExpenses();
        const total = expenses.reduce((s,e)=>s+e.amount,0);
        const avgDaily = total / 30;
        const maxDay = this.getMaxSpendingDay(expenses);
        document.getElementById('totalExpenses').textContent = `$${total.toFixed(2)}`;
        document.getElementById('averageDaily').textContent = `$${avgDaily.toFixed(2)}`;
        document.getElementById('highestDay').textContent = maxDay ? `$${maxDay.amount.toFixed(2)}` : '$0';
        document.getElementById('transactionCount').textContent = expenses.length;
        if(this.expenseChart) { this.expenseChart.renderCategoryChart(expenses); this.expenseChart.renderTrendChart(expenses); }
        const breakdown = document.getElementById('categoryBreakdown');
        if(breakdown && this.categorySummary) breakdown.innerHTML = this.categorySummary.render(expenses, total);
    }

    getMaxSpendingDay(expenses) {
        const daily = {};
        expenses.forEach(e => { daily[e.date] = (daily[e.date] || 0) + e.amount; });
        let maxDate = null, maxAmount = 0;
        for(const [date, amount] of Object.entries(daily)) if(amount > maxAmount) { maxAmount = amount; maxDate = date; }
        return maxDate ? { date: maxDate, amount: maxAmount } : null;
    }
}
window.AnalyticsManager = AnalyticsManager;