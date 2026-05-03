class StateManager {
    constructor() {
        this.state = {
            expenses: [],
            categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'],
            currentPeriod: 'monthly',
            currentDate: new Date(),
            filters: { category: 'all', date: null },
            sampleDataLoaded: false
        };
        this.listeners = new Map();
        this.loadFromStorage();
        if(this.state.expenses.length === 0) this.initSampleData();
    }

    initSampleData() {
        const now = new Date();
        const categories = this.state.categories;
        for(let i=0; i<30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            this.state.expenses.push({
                id: Date.now() + i,
                title: `Sample ${categories[Math.floor(Math.random()*categories.length)]} ${i+1}`,
                amount: +(Math.random() * 100 + 10).toFixed(2),
                category: categories[Math.floor(Math.random()*categories.length)],
                date: date.toISOString().split('T')[0],
                notes: 'Sample transaction',
                createdAt: new Date().toISOString()
            });
        }
        this.saveToStorage();
        this.notifyListeners('expenses', this.state.expenses);
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    addExpense(expense) {
        const newExpense = { id: Date.now(), createdAt: new Date().toISOString(), ...expense };
        this.state.expenses.unshift(newExpense);
        this.notifyListeners('expenses', this.state.expenses);
        this.saveToStorage();
        return newExpense;
    }
    updateExpense(id, updates) {
        const idx = this.state.expenses.findIndex(e=>e.id===id);
        if(idx!==-1) { this.state.expenses[idx] = {...this.state.expenses[idx], ...updates}; this.notifyListeners('expenses', this.state.expenses); this.saveToStorage(); return true; }
        return false;
    }
    deleteExpense(id) { this.state.expenses = this.state.expenses.filter(e=>e.id!==id); this.notifyListeners('expenses', this.state.expenses); this.saveToStorage(); }
    getFilteredExpenses() {
        let expenses = [...this.state.expenses];
        if(this.state.filters.category !== 'all') expenses = expenses.filter(e=>e.category===this.state.filters.category);
        if(this.state.filters.date) expenses = expenses.filter(e=>e.date===this.state.filters.date);
        return expenses;
    }
    saveToStorage() { try { localStorage.setItem('expense_state', JSON.stringify({ expenses: this.state.expenses })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('expense_state'); if(saved) { const data = JSON.parse(saved); this.state.expenses = data.expenses || []; } } catch(e){} }
}
window.StateManager = StateManager;