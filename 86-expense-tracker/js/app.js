document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const expenseChart = new ExpenseChart(stateManager, eventBus);
    const categorySummary = new CategorySummary(stateManager, eventBus);
    const expenseManager = new ExpenseManager(stateManager, eventBus);
    const categoryManager = new CategoryManager(stateManager, eventBus);
    const analyticsManager = new AnalyticsManager(stateManager, eventBus, expenseChart, categorySummary);
    const chartManager = new ChartManager(stateManager, eventBus);
    const budgetManager = new BudgetManager(stateManager, eventBus);
    
    window.app = { stateManager, eventBus, expenseManager, categoryManager, analyticsManager, budgetManager };
    
    // Period navigation
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => { btn.onclick = () => { periodBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); stateManager.set('currentPeriod', btn.dataset.period); eventBus.emit('period:changed'); }; });
    
    eventBus.on('toast', ({message,type}) => { const toast = document.getElementById('toast'); toast.textContent = message; toast.className = `toast ${type} show`; setTimeout(()=>toast.classList.remove('show'), 3000); });
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    console.log('Expense Tracker Ready!');
});
window.closeModal = function() { document.querySelectorAll('.modal').forEach(m=>m.classList.remove('active')); };