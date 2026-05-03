class CategorySummary {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(expenses, total) {
        const categoryTotals = {};
        expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
        const categories = Object.keys(categoryTotals).sort((a,b)=>categoryTotals[b]-categoryTotals[a]);
        if(categories.length === 0) return '<div class="no-data">No data available</div>';
        return categories.map(cat => {
            const amount = categoryTotals[cat];
            const percent = total > 0 ? (amount / total * 100).toFixed(1) : 0;
            return `
                <div class="category-item">
                    <div><span class="category-name">${cat}</span><span class="category-percent"> (${percent}%)</span></div>
                    <div class="category-amount">$${amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
}
window.CategorySummary = CategorySummary;