class ExpenseList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(expenses) {
        if(expenses.length === 0) return '';
        return expenses.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="expense-info">
                    <div class="expense-title">${this.escapeHtml(expense.title)}</div>
                    <div class="expense-meta">
                        <span><i class="fas fa-tag"></i> ${expense.category}</span>
                        <span><i class="far fa-calendar"></i> ${expense.date}</span>
                        ${expense.notes ? `<span><i class="fas fa-pencil-alt"></i> ${this.escapeHtml(expense.notes.substring(0,30))}</span>` : ''}
                    </div>
                </div>
                <div class="expense-amount">$${parseFloat(expense.amount).toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="edit-expense" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-expense" data-id="${expense.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
}
window.ExpenseList = ExpenseList;