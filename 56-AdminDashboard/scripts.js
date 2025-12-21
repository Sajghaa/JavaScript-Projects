// Dashboard Module - Main Application
const DashboardApp = (function() {
    // Private variables
    let currentTheme = 'light';
    let sidebarCollapsed = false;
    
    // Initialize the dashboard
    function init() {
        // Initialize date
        updateCurrentDate();
        
        // Initialize stats cards
        StatsModule.init();
        
        // Initialize charts
        ChartsModule.init();
        
        // Initialize tables
        TablesModule.init();
        
        // Initialize event listeners
        setupEventListeners();
        
        // Log initialization
        console.log('Admin Dashboard initialized successfully');
    }
    
    // Update current date in header
    function updateCurrentDate() {
        const dateElement = document.querySelector('.current-date');
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarCollapsed = !sidebarCollapsed;
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', toggleTheme);
        
        // Chart period selectors
        const revenuePeriod = document.getElementById('revenue-period');
        const usersPeriod = document.getElementById('users-period');
        
        revenuePeriod.addEventListener('change', () => {
            ChartsModule.updateRevenueChart(revenuePeriod.value);
        });
        
        usersPeriod.addEventListener('change', () => {
            ChartsModule.updateUsersChart(usersPeriod.value);
        });
        
        // View all buttons
        const viewAllButtons = document.querySelectorAll('.view-all-btn');
        viewAllButtons.forEach(button => {
            button.addEventListener('click', () => {
                alert('This would navigate to a detailed view in a real application.');
            });
        });
        
        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                alert(`Searching for: ${searchInput.value}`);
                searchInput.value = '';
            }
        });
        
        // Notification button
        const notificationBtn = document.querySelector('.notification-btn');
        notificationBtn.addEventListener('click', () => {
            alert('You have 3 new notifications');
        });
    }
    
    // Toggle between light and dark mode
    function toggleTheme() {
        const body = document.body;
        const themeToggleIcon = document.querySelector('#theme-toggle i');
        
        if (currentTheme === 'light') {
            body.classList.add('dark-mode');
            themeToggleIcon.className = 'fas fa-sun';
            currentTheme = 'dark';
        } else {
            body.classList.remove('dark-mode');
            themeToggleIcon.className = 'fas fa-moon';
            currentTheme = 'light';
        }
        
        // Save theme preference to localStorage
        localStorage.setItem('dashboard-theme', currentTheme);
    }
    
    // Load saved theme from localStorage
    function loadSavedTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme');
        const themeToggleIcon = document.querySelector('#theme-toggle i');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleIcon.className = 'fas fa-sun';
            currentTheme = 'dark';
        }
    }
    
    // Public API
    return {
        init: init,
        loadSavedTheme: loadSavedTheme
    };
})();

// Stats Module - Handles statistics cards
const StatsModule = (function() {
    // Stats data
    const statsData = [
        {
            id: 1,
            title: 'Total Revenue',
            value: '$24,580',
            change: '+12.5%',
            changeType: 'positive',
            icon: 'fas fa-dollar-sign',
            iconColor: '#10b981',
            iconBg: '#d1fae5'
        },
        {
            id: 2,
            title: 'New Users',
            value: '1,254',
            change: '+5.2%',
            changeType: 'positive',
            icon: 'fas fa-users',
            iconColor: '#3b82f6',
            iconBg: '#dbeafe'
        },
        {
            id: 3,
            title: 'Orders',
            value: '342',
            change: '-2.1%',
            changeType: 'negative',
            icon: 'fas fa-shopping-cart',
            iconColor: '#f59e0b',
            iconBg: '#fef3c7'
        },
        {
            id: 4,
            title: 'Conversion Rate',
            value: '3.24%',
            change: '+0.8%',
            changeType: 'positive',
            icon: 'fas fa-chart-line',
            iconColor: '#8b5cf6',
            iconBg: '#ede9fe'
        }
    ];
    
    // Initialize stats cards
    function init() {
        renderStatsCards();
    }
    
    // Render stats cards to the DOM
    function renderStatsCards() {
        const statsContainer = document.getElementById('stats-cards');
        
        if (!statsContainer) return;
        
        statsContainer.innerHTML = statsData.map(stat => `
            <div class="stat-card">
                <div class="stat-card-content">
                    <h3>${stat.title}</h3>
                    <div class="value">${stat.value}</div>
                    <div class="change ${stat.changeType}">
                        <i class="fas fa-arrow-${stat.changeType === 'positive' ? 'up' : 'down'}"></i>
                        ${stat.change}
                    </div>
                </div>
                <div class="stat-card-icon" style="background-color: ${stat.iconBg}; color: ${stat.iconColor}">
                    <i class="${stat.icon}"></i>
                </div>
            </div>
        `).join('');
    }
    
    // Public API
    return {
        init: init
    };
})();

// Charts Module - Handles chart creation and updates
const ChartsModule = (function() {
    // Chart instances
    let revenueChart;
    let usersChart;
    
    // Chart data
    const chartData = {
        monthly: {
            revenue: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 30000, 40000, 38000, 45000],
            users: [150, 220, 180, 300, 280, 350, 320, 400, 380, 450, 420, 500]
        },
        quarterly: {
            revenue: [54000, 82000, 105000, 138000],
            users: [750, 1050, 1250, 1650]
        },
        yearly: {
            revenue: [250000, 320000, 295000, 410000],
            users: [2500, 3200, 2900, 4500]
        }
    };
    
    // Initialize charts
    function init() {
        createRevenueChart();
        createUsersChart();
    }
    
    // Create revenue chart
    function createRevenueChart() {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        
        // Get current period
        const periodSelect = document.getElementById('revenue-period');
        const period = periodSelect.value;
        
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: getLabelsForPeriod(period),
                datasets: [{
                    label: 'Revenue ($)',
                    data: chartData[period].revenue,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
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
    
    // Create users chart
    function createUsersChart() {
        const ctx = document.getElementById('users-chart').getContext('2d');
        
        // Get current period
        const periodSelect = document.getElementById('users-period');
        const period = periodSelect.value;
        
        usersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: getLabelsForPeriod(period),
                datasets: [{
                    label: 'New Users',
                    data: chartData[period].users,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 100
                        },
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
    
    // Update revenue chart based on period
    function updateRevenueChart(period) {
        if (!revenueChart) return;
        
        revenueChart.data.labels = getLabelsForPeriod(period);
        revenueChart.data.datasets[0].data = chartData[period].revenue;
        revenueChart.update();
    }
    
    // Update users chart based on period
    function updateUsersChart(period) {
        if (!usersChart) return;
        
        usersChart.data.labels = getLabelsForPeriod(period);
        usersChart.data.datasets[0].data = chartData[period].users;
        usersChart.update();
    }
    
    // Get labels for a given period
    function getLabelsForPeriod(period) {
        switch(period) {
            case 'monthly':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            case 'quarterly':
                return ['Q1', 'Q2', 'Q3', 'Q4'];
            case 'yearly':
                return ['2020', '2021', '2022', '2023'];
            default:
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }
    }
    
    // Public API
    return {
        init: init,
        updateRevenueChart: updateRevenueChart,
        updateUsersChart: updateUsersChart
    };
})();

// Tables Module - Handles data tables
const TablesModule = (function() {
    // Orders data
    const ordersData = [
        { id: '#ORD-001', customer: 'John Smith', date: '2023-06-12', status: 'completed', amount: '$245.99' },
        { id: '#ORD-002', customer: 'Emma Johnson', date: '2023-06-11', status: 'pending', amount: '$128.50' },
        { id: '#ORD-003', customer: 'Michael Brown', date: '2023-06-10', status: 'processing', amount: '$367.25' },
        { id: '#ORD-004', customer: 'Sarah Davis', date: '2023-06-09', status: 'completed', amount: '$89.99' },
        { id: '#ORD-005', customer: 'Robert Wilson', date: '2023-06-08', status: 'completed', amount: '$542.75' },
        { id: '#ORD-006', customer: 'Lisa Anderson', date: '2023-06-07', status: 'pending', amount: '$210.00' },
        { id: '#ORD-007', customer: 'David Taylor', date: '2023-06-06', status: 'processing', amount: '$156.30' }
    ];
    
    // Products data
    const productsData = [
        { name: 'Wireless Headphones', category: 'Electronics', price: '$129.99', sold: 245, revenue: '$31,847.55' },
        { name: 'Smart Watch Pro', category: 'Wearables', price: '$299.99', sold: 189, revenue: '$56,698.11' },
        { name: 'Laptop Backpack', category: 'Accessories', price: '$49.99', sold: 312, revenue: '$15,596.88' },
        { name: 'Bluetooth Speaker', category: 'Electronics', price: '$89.99', sold: 278, revenue: '$25,017.22' },
        { name: 'Fitness Tracker', category: 'Wearables', price: '$79.99', sold: 421, revenue: '$33,675.79' }
    ];
    
    // Initialize tables
    function init() {
        renderOrdersTable();
        renderProductsTable();
    }
    
    // Render orders table
    function renderOrdersTable() {
        const tableBody = document.querySelector('#orders-table tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = ordersData.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${formatDate(order.date)}</td>
                <td><span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                <td>${order.amount}</td>
                <td><button class="action-btn" onclick="TablesModule.viewOrder('${order.id}')">View</button></td>
            </tr>
        `).join('');
    }
    
    // Render products table
    function renderProductsTable() {
        const tableBody = document.querySelector('#products-table tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = productsData.map(product => `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td>${product.sold}</td>
                <td>${product.revenue}</td>
            </tr>
        `).join('');
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    // View order details
    function viewOrder(orderId) {
        alert(`Viewing details for order: ${orderId}`);
    }
    
    // Public API
    return {
        init: init,
        viewOrder: viewOrder
    };
})();

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DashboardApp.loadSavedTheme();
    DashboardApp.init();
});