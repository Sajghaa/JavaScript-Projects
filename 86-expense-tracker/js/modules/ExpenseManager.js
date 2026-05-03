class ExpenseManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.expenseList = new ExpenseList(stateManager, eventBus);
        this.expenseForm = new ExpenseForm(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderExpenses();
        this.eventBus.on('expense:add', (data) => this.addExpense(data));
        this.eventBus.on('expense:update', (data) => this.updateExpense(data));
        this.eventBus.on('expense:delete', (id) => this.deleteExpense(id));
        this.eventBus.on('expenses:refresh', () => this.renderExpenses());
        document.getElementById('categoryFilter').onchange = () => this.applyFilters();
        document.getElementById('dateFilter').onchange = () => this.applyFilters();
        document.getElementById('clearFiltersBtn').onclick = () => this.clearFilters();
    }

    addExpense(data) { this.stateManager.addExpense(data); this.eventBus.emit('toast', { message: 'Expense added', type: 'success' }); this.renderExpenses(); }
    updateExpense(data) { this.stateManager.updateExpense(data.id, data); this.eventBus.emit('toast', { message: 'Expense updated', type: 'success' }); this.renderExpenses(); }
    deleteExpense(id) { this.stateManager.deleteExpense(id); this.eventBus.emit('toast', { message: 'Expense deleted', type: 'info' }); this.renderExpenses(); }

    renderExpenses() {
        const expenses = this.stateManager.getFilteredExpenses();
        const container = document.getElementById('expensesList');
        const noExpenses = document.getElementById('noExpenses');
        if(expenses.length === 0) { container.innerHTML = ''; noExpenses.style.display = 'block'; }
        else { container.innerHTML = this.expenseList.render(expenses); noExpenses.style.display = 'none'; this.attachEvents(); }
    }

    attachEvents() {
        document.querySelectorAll('.edit-expense').forEach(btn => { btn.onclick = () => { const expense = this.stateManager.get('expenses').find(e=>e.id===parseInt(btn.dataset.id)); if(expense) this.expenseForm.showEditModal(expense); }; });
        document.querySelectorAll('.delete-expense').forEach(btn => { btn.onclick = () => { if(confirm('Delete this expense?')) this.eventBus.emit('expense:delete', parseInt(btn.dataset.id)); }; });
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter').value;
        const date = document.getElementById('dateFilter').value;
        this.stateManager.set('filters.category', category);
        this.stateManager.set('filters.date', date || null);
        this.renderExpenses();
        this.eventBus.emit('filters:changed');
    }

    clearFilters() { document.getElementById('categoryFilter').value = 'all'; document.getElementById('dateFilter').value = ''; this.applyFilters(); }
}
window.ExpenseManager = ExpenseManager;