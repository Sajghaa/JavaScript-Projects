class ExpenseForm {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentEditId = null;
        this.init();
    }

    init() {
        document.getElementById('saveExpenseBtn').onclick = () => this.saveExpense();
        document.getElementById('updateExpenseBtn').onclick = () => this.updateExpense();
        document.getElementById('deleteExpenseBtn').onclick = () => this.deleteExpense();
        document.getElementById('addExpenseBtn').onclick = () => this.showAddModal();
        document.getElementById('expenseDate').valueAsDate = new Date();
    }

    showAddModal() {
        this.currentEditId = null;
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        document.getElementById('expenseModal').classList.add('active');
    }

    showEditModal(expense) {
        this.currentEditId = expense.id;
        document.getElementById('editExpenseId').value = expense.id;
        document.getElementById('editExpenseTitle').value = expense.title;
        document.getElementById('editExpenseAmount').value = expense.amount;
        document.getElementById('editExpenseCategory').value = expense.category;
        document.getElementById('editExpenseDate').value = expense.date;
        document.getElementById('editExpenseNotes').value = expense.notes || '';
        document.getElementById('editExpenseModal').classList.add('active');
    }

    saveExpense() {
        const title = document.getElementById('expenseTitle').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;
        const notes = document.getElementById('expenseNotes').value;
        if(!title || !amount || !category || !date) { this.eventBus.emit('toast', { message: 'Please fill all fields', type: 'error' }); return; }
        this.eventBus.emit('expense:add', { title, amount, category, date, notes });
        this.closeModal();
    }

    updateExpense() {
        const id = parseInt(document.getElementById('editExpenseId').value);
        const title = document.getElementById('editExpenseTitle').value;
        const amount = parseFloat(document.getElementById('editExpenseAmount').value);
        const category = document.getElementById('editExpenseCategory').value;
        const date = document.getElementById('editExpenseDate').value;
        const notes = document.getElementById('editExpenseNotes').value;
        this.eventBus.emit('expense:update', { id, title, amount, category, date, notes });
        this.closeModal();
    }

    deleteExpense() { if(confirm('Delete this expense?')) { this.eventBus.emit('expense:delete', parseInt(document.getElementById('editExpenseId').value)); this.closeModal(); } }
    closeModal() { document.getElementById('expenseModal').classList.remove('active'); document.getElementById('editExpenseModal').classList.remove('active'); }
}
window.ExpenseForm = ExpenseForm;