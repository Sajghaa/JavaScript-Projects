// app.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseCategoryInput = document.getElementById('expense-category');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseNotesInput = document.getElementById('expense-notes');
    const typeButtons = document.querySelectorAll('.type-btn');
    const expensesList = document.getElementById('expenses-list');
    const totalBalanceElement = document.getElementById('total-balance');
    const monthIncomeElement = document.getElementById('month-income');
    const monthExpenseElement = document.getElementById('month-expense');
    const highestExpenseElement = document.getElementById('highest-expense');
    const avgDailyExpenseElement = document.getElementById('avg-daily-expense');
    const totalTransactionsElement = document.getElementById('total-transactions');
    const filterCategoryInput = document.getElementById('filter-category');
    const filterMonthInput = document.getElementById('filter-month');
    const filterTypeInput = document.getElementById('filter-type');
    const clearFiltersButton = document.getElementById('clear-filters');
    const exportDataButton = document.getElementById('export-data');
    const clearDataButton = document.getElementById('clear-data');
    
    // Chart instances
    let categoryChart = null;
    let monthlyChart = null;
    
    // Application state
    let transactions = [];
    let currentTransactionType = 'expense';
    let currentFilters = {
        category: 'all',
        month: 'all',
        type: 'all'
    };
    
    // Category colors for charts
    const categoryColors = {
        'Food': '#f59e0b',
        'Transport': '#3b82f6',
        'Shopping': '#8b5cf6',
        'Housing': '#10b981',
        'Entertainment': '#ec4899',
        'Healthcare': '#ef4444',
        'Education': '#06b6d4',
        'Other': '#64748b'
    };
    
    // Initialize the app
    function init() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        expenseDateInput.value = today;
        expenseDateInput.max = today;
        
        // Load transactions from localStorage
        loadTransactions();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize charts
        initCharts();
        
        // Render UI
        renderUI();
    }
    
    // Load transactions from localStorage
    function loadTransactions() {
        const transactionsJson = localStorage.getItem('expenseTracker');
        if (transactionsJson) {
            transactions = JSON.parse(transactionsJson);
        }
    }
    
    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('expenseTracker', JSON.stringify(transactions));
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Form submission
        expenseForm.addEventListener('submit', handleAddTransaction);
        
        // Type toggle buttons
        typeButtons.forEach(button => {
            button.addEventListener('click', function() {
                typeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentTransactionType = this.dataset.type;
            });
        });
        
        // Filter changes
        filterCategoryInput.addEventListener('change', updateFilters);
        filterMonthInput.addEventListener('change', updateFilters);
        filterTypeInput.addEventListener('change', updateFilters);
        
        // Clear filters button
        clearFiltersButton.addEventListener('click', clearFilters);
        
        // Export data button
        exportDataButton.addEventListener('click', exportData);
        
        // Clear data button
        clearDataButton.addEventListener('click', clearAllData);
        
        // Handle delete and edit events (delegated)
        expensesList.addEventListener('click', function(e) {
            if (e.target.closest('.btn-delete')) {
                const transactionItem = e.target.closest('.transaction-item');
                const transactionId = transactionItem.dataset.id;
                deleteTransaction(transactionId);
            }
            
            if (e.target.closest('.btn-edit')) {
                const transactionItem = e.target.closest('.transaction-item');
                const transactionId = transactionItem.dataset.id;
                editTransaction(transactionId);
            }
        });
    }
    
    // Handle adding a new transaction
    function handleAddTransaction(e) {
        e.preventDefault();
        
        // Validate inputs
        if (!expenseNameInput.value.trim() || !expenseAmountInput.value || !expenseCategoryInput.value) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: Date.now().toString(),
            name: expenseNameInput.value.trim(),
            amount: parseFloat(expenseAmountInput.value),
            category: expenseCategoryInput.value,
            date: expenseDateInput.value,
            type: currentTransactionType,
            notes: expenseNotesInput.value.trim(),
            createdAt: new Date().toISOString()
        };
        
        // Add to transactions array
        transactions.unshift(transaction);
        
        // Save and update UI
        saveTransactions();
        renderUI();
        
        // Reset form
        expenseForm.reset();
        expenseDateInput.value = new Date().toISOString().split('T')[0];
        
        // Reset type toggle to expense
        typeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.type-btn[data-type="expense"]').classList.add('active');
        currentTransactionType = 'expense';
        
        // Show success message
        showNotification(`${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    }
    
    // Delete a transaction
    function deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }
        
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        renderUI();
        
        showNotification('Transaction deleted successfully!', 'success');
    }
    
    // Edit a transaction (placeholder for now)
    function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        // Populate form with transaction data
        expenseNameInput.value = transaction.name;
        expenseAmountInput.value = transaction.amount;
        expenseCategoryInput.value = transaction.category;
        expenseDateInput.value = transaction.date;
        expenseNotesInput.value = transaction.notes || '';
        
        // Set transaction type
        typeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.type-btn[data-type="${transaction.type}"]`).classList.add('active');
        currentTransactionType = transaction.type;
        
        // Remove the transaction (we'll add it back on save)
        transactions = transactions.filter(t => t.id !== id);
        
        // Change button text
        const submitButton = expenseForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Transaction';
        
        // Scroll to form
        expenseForm.scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Editing transaction. Update the fields and click "Update Transaction" to save.', 'info');
    }
    
    // Update filters
    function updateFilters() {
        currentFilters = {
            category: filterCategoryInput.value,
            month: filterMonthInput.value,
            type: filterTypeInput.value
        };
        
        renderUI();
    }
    
    // Clear all filters
    function clearFilters() {
        filterCategoryInput.value = 'all';
        filterMonthInput.value = 'all';
        filterTypeInput.value = 'all';
        
        currentFilters = {
            category: 'all',
            month: 'all',
            type: 'all'
        };
        
        renderUI();
    }
    
    // Export data as JSON
    function exportData() {
        const dataStr = JSON.stringify(transactions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Data exported successfully!', 'success');
    }
    
    // Clear all data
    function clearAllData() {
        if (!confirm('Are you sure you want to delete ALL transactions? This action cannot be undone.')) {
            return;
        }
        
        transactions = [];
        saveTransactions();
        renderUI();
        
        showNotification('All data cleared successfully!', 'success');
    }
    
    // Show notification
    function showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Initialize charts
    function initCharts() {
        // Category chart (pie/doughnut)
        const categoryCtx = document.getElementById('category-chart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        // Monthly chart (line)
        const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
        monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Expenses',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Income',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
    }
    
    // Get filtered transactions based on current filters
    function getFilteredTransactions() {
        return transactions.filter(transaction => {
            // Filter by category
            if (currentFilters.category !== 'all' && transaction.category !== currentFilters.category) {
                return false;
            }
            
            // Filter by type
            if (currentFilters.type !== 'all' && transaction.type !== currentFilters.type) {
                return false;
            }
            
            // Filter by month
            if (currentFilters.month !== 'all') {
                const transactionDate = new Date(transaction.date);
                const transactionMonthYear = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (transactionMonthYear !== currentFilters.month) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    // Calculate statistics
    function calculateStats() {
        const filteredTransactions = getFilteredTransactions();
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculate totals
        let totalBalance = 0;
        let monthIncome = 0;
        let monthExpense = 0;
        let highestExpense = 0;
        let totalTransactionsCount = filteredTransactions.length;
        
        // Current month transactions
        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            return transactionMonth === currentMonth;
        });
        
        // Calculate totals
        filteredTransactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalBalance += transaction.amount;
            } else {
                totalBalance -= transaction.amount;
                
                if (transaction.amount > highestExpense) {
                    highestExpense = transaction.amount;
                }
            }
        });
        
        // Calculate current month income/expense
        currentMonthTransactions.forEach(transaction => {
            if (transaction.type === 'income') {
                monthIncome += transaction.amount;
            } else {
                monthExpense += transaction.amount;
            }
        });
        
        // Calculate average daily expense for current month
        const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
        const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
        const avgDailyExpense = totalExpensesThisMonth / currentDate.getDate();
        
        return {
            totalBalance,
            monthIncome,
            monthExpense,
            highestExpense,
            avgDailyExpense,
            totalTransactionsCount
        };
    }
    
    // Update charts with data
    function updateCharts() {
        const filteredTransactions = getFilteredTransactions();
        const expensesByCategory = {};
        const monthlyData = {};
        
        // Initialize category data
        Object.keys(categoryColors).forEach(category => {
            expensesByCategory[category] = 0;
        });
        
        // Calculate category expenses
        filteredTransactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                expensesByCategory[transaction.category] += transaction.amount;
            }
        });
        
        // Prepare category chart data
        const categoryLabels = [];
        const categoryData = [];
        const categoryBackgroundColors = [];
        
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            if (amount > 0) {
                categoryLabels.push(category);
                categoryData.push(amount);
                categoryBackgroundColors.push(categoryColors[category]);
            }
        });
        
        // Update category chart
        categoryChart.data.labels = categoryLabels;
        categoryChart.data.datasets[0].data = categoryData;
        categoryChart.data.datasets[0].backgroundColor = categoryBackgroundColors;
        categoryChart.update();
        
        // Calculate monthly data (last 6 months)
        const currentDate = new Date();
        const months = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(currentDate.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthKey);
            
            monthlyData[monthKey] = {
                expenses: 0,
                income: 0
            };
        }
        
        // Calculate monthly totals
        filteredTransactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                if (transaction.type === 'expense') {
                    monthlyData[monthKey].expenses += transaction.amount;
                } else {
                    monthlyData[monthKey].income += transaction.amount;
                }
            }
        });
        
        // Prepare monthly chart data
        const monthlyExpensesData = months.map(month => monthlyData[month].expenses);
        const monthlyIncomeData = months.map(month => monthlyData[month].income);
        
        // Format month labels for display
        const monthLabels = months.map(month => {
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        // Update monthly chart
        monthlyChart.data.labels = monthLabels;
        monthlyChart.data.datasets[0].data = monthlyExpensesData;
        monthlyChart.data.datasets[1].data = monthlyIncomeData;
        monthlyChart.update();
        
        // Update category breakdown
        updateCategoryBreakdown(expensesByCategory);
    }
    
    // Update category breakdown list
    function updateCategoryBreakdown(expensesByCategory) {
        const categoryBreakdownElement = document.getElementById('category-breakdown');
        let totalExpenses = 0;
        
        // Calculate total expenses
        Object.values(expensesByCategory).forEach(amount => {
            totalExpenses += amount;
        });
        
        // Generate HTML for category breakdown
        let html = '';
        
        Object.entries(expensesByCategory)
            .filter(([category, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, amount]) => {
                const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                
                html += `
                    <div class="category-item">
                        <div class="category-info">
                            <div class="category-color category-${category}" style="background-color: ${categoryColors[category]}"></div>
                            <span class="category-name">${category}</span>
                        </div>
                        <div>
                            <span class="category-percentage">${percentage}%</span>
                            <span class="category-amount">$${amount.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            });
        
        categoryBreakdownElement.innerHTML = html || '<p>No expenses to display</p>';
    }
    
    // Populate month filter options
    function populateMonthFilter() {
        const uniqueMonths = new Set();
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            uniqueMonths.add(monthKey);
        });
        
        // Sort months in descending order
        const sortedMonths = Array.from(uniqueMonths).sort().reverse();
        
        // Clear and populate select
        filterMonthInput.innerHTML = '<option value="all">All Months</option>';
        
        sortedMonths.forEach(month => {
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            const option = document.createElement('option');
            option.value = month;
            option.textContent = monthName;
            filterMonthInput.appendChild(option);
        });
    }
    
    // Render transactions list
    function renderTransactionsList() {
        const filteredTransactions = getFilteredTransactions();
        const template = document.getElementById('transaction-template');
        
        if (filteredTransactions.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No transactions found</h3>
                    <p>${transactions.length === 0 ? 'Add your first transaction using the form above' : 'Try changing your filters'}</p>
                </div>
            `;
            return;
        }
        
        expensesList.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const transactionElement = template.content.cloneNode(true);
            const transactionItem = transactionElement.querySelector('.transaction-item');
            
            // Set data attributes
            transactionItem.dataset.id = transaction.id;
            
            // Set transaction details
            transactionItem.querySelector('.transaction-name').textContent = transaction.name;
            
            const amountElement = transactionItem.querySelector('.transaction-amount');
            amountElement.textContent = `$${transaction.amount.toFixed(2)}`;
            amountElement.classList.add(transaction.type);
            
            // Set category with color coding
            const categoryElement = transactionItem.querySelector('.transaction-category');
            categoryElement.textContent = transaction.category;
            categoryElement.classList.add(`category-${transaction.category}`);
            
            // Format date
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            transactionItem.querySelector('.transaction-date').textContent = formattedDate;
            
            // Set notes if available
            const notesElement = transactionItem.querySelector('.transaction-notes');
            if (transaction.notes) {
                notesElement.textContent = transaction.notes;
            } else {
                notesElement.style.display = 'none';
            }
            
            // Set icon based on category
            const iconElement = transactionItem.querySelector('.transaction-icon i');
            const categoryIcons = {
                'Food': 'fas fa-utensils',
                'Transport': 'fas fa-car',
                'Shopping': 'fas fa-shopping-bag',
                'Housing': 'fas fa-home',
                'Entertainment': 'fas fa-film',
                'Healthcare': 'fas fa-heartbeat',
                'Education': 'fas fa-graduation-cap',
                'Other': 'fas fa-receipt'
            };
            
            iconElement.className = categoryIcons[transaction.category] || 'fas fa-receipt';
            
            expensesList.appendChild(transactionElement);
        });
    }
    
    // Render the entire UI
    function renderUI() {
        // Update statistics
        const stats = calculateStats();
        
        totalBalanceElement.textContent = `$${stats.totalBalance.toFixed(2)}`;
        monthIncomeElement.textContent = `$${stats.monthIncome.toFixed(2)}`;
        monthExpenseElement.textContent = `$${stats.monthExpense.toFixed(2)}`;
        highestExpenseElement.textContent = `$${stats.highestExpense.toFixed(2)}`;
        avgDailyExpenseElement.textContent = `$${stats.avgDailyExpense.toFixed(2)}`;
        totalTransactionsElement.textContent = stats.totalTransactionsCount;
        
        // Update charts
        updateCharts();
        
        // Populate month filter
        populateMonthFilter();
        
        // Render transactions list
        renderTransactionsList();
    }
    
    // Add notification styles to the page
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-info i {
            color: #3b82f6;
        }
        
        .notification span {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            display: flex;
            align-items: center;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    // Initialize the application
    init();
});