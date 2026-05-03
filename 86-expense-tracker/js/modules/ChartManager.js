class ChartManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.expenseChart = new ExpenseChart(stateManager, eventBus);
        this.categorySummary = new CategorySummary(stateManager, eventBus);
    }
}
window.ChartManager = ChartManager;