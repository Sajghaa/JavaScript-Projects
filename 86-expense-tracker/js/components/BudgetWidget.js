class BudgetWidget {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.budgets = JSON.parse(localStorage.getItem('budgets')) || {};
        this.init();
    }

    init() { this.render(); }

    render() {
        const container = document.getElementById('budgetWidget');
        if(!container) return;
        const totalSpent = this.getMonthlyTotal();
        const monthlyBudget = this.budgets.monthly || 2000;
        const percent = (totalSpent / monthlyBudget * 100).toFixed(1);
        container.innerHTML = `
            <div class="budget-card">
                <h4>Monthly Budget</h4>
                <div class="budget-amount">$${totalSpent.toFixed(2)} / $${monthlyBudget}</div>
                <div class="budget-progress"><div class="budget-fill" style="width: ${Math.min(percent,100)}%"></div></div>
                <div class="budget-status ${percent>100?'over':''}">${percent>100?'Over budget!':`${percent}% used`}</div>
                <button class="btn btn-secondary btn-sm" onclick="app.budgetManager.setBudget()">Set Budget</button>
            </div>
        `;
    }

    getMonthlyTotal() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const expenses = this.stateManager.get('expenses').filter(e => {
            const d = new Date(e.date);
            return d.getFullYear()===year && d.getMonth()===month;
        });
        return expenses.reduce((s,e)=>s+e.amount,0);
    }
}
window.BudgetWidget = BudgetWidget;