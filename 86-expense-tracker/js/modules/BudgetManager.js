class BudgetManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.budgetWidget = new BudgetWidget(stateManager, eventBus);
        this.init();
    }

    init() { this.eventBus.on('expenses:refresh', () => this.budgetWidget.render()); }

    setBudget() {
        const current = this.budgetWidget.budgets.monthly || 2000;
        const newBudget = prompt('Set monthly budget:', current);
        if(newBudget && !isNaN(newBudget) && parseFloat(newBudget)>0) { this.budgetWidget.budgets.monthly = parseFloat(newBudget); localStorage.setItem('budgets', JSON.stringify(this.budgetWidget.budgets)); this.budgetWidget.render(); this.eventBus.emit('toast', { message: 'Budget updated', type: 'success' }); }
    }
}
window.BudgetManager = BudgetManager;