document.addEventListener('DOMContentLoaded', function() {
    // Initialize core
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const toast = new NotificationToast();
    
    // Initialize modules
    const taskManager = new TaskManager(stateManager, eventBus);
    const notificationManager = new NotificationManager(stateManager, eventBus);
    const filterManager = new FilterManager(stateManager, eventBus);
    const calendarManager = new CalendarManager(stateManager, eventBus, taskManager);
    const analyticsManager = new AnalyticsManager(stateManager, eventBus);
    
    // Store globally for access
    window.app = {
        stateManager,
        eventBus,
        taskManager,
        notificationManager,
        filterManager,
        calendarManager,
        analyticsManager
    };
    
    // Setup UI event listeners
    document.getElementById('addTaskBtn').onclick = () => taskManager.showAddTaskModal();
    document.getElementById('emptyStateAddBtn').onclick = () => taskManager.showAddTaskModal();
    document.getElementById('enableNotificationsBtn').onclick = () => notificationManager.requestPermission();
    
    // Search
    document.getElementById('searchInput').oninput = (e) => {
        stateManager.set('searchQuery', e.target.value);
        taskManager.renderTasks();
    };
    
    // View toggle
    document.getElementById('viewToggleBtn').onclick = () => {
        const currentView = stateManager.get('viewMode');
        const newView = currentView === 'list' ? 'calendar' : 'list';
        stateManager.set('viewMode', newView);
        
        const tasksContainer = document.getElementById('tasksContainer');
        const calendarView = document.getElementById('calendarView');
        const toggleIcon = document.querySelector('#viewToggleBtn i');
        
        if (newView === 'calendar') {
            tasksContainer.classList.add('hidden');
            calendarView.classList.remove('hidden');
            toggleIcon.className = 'fas fa-list';
            calendarManager.renderCalendar();
        } else {
            tasksContainer.classList.remove('hidden');
            calendarView.classList.add('hidden');
            toggleIcon.className = 'fas fa-calendar-alt';
        }
    };
    
    // Close modal on outside click
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            taskManager.closeModal();
        }
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            taskManager.showAddTaskModal();
        }
        if (e.key === 'Escape') {
            taskManager.closeModal();
        }
    });
    
    // Event listeners
    eventBus.on('tasks:updated', () => {
        taskManager.renderTasks();
        analyticsManager.updateStats();
        calendarManager.renderCalendar();
    });
    
    eventBus.on('toast', ({ message, type }) => {
        toast.show(message, type);
    });
    
    eventBus.on('notification:permission', (enabled) => {
        const permBox = document.getElementById('notificationPermission');
        if (enabled && permBox) {
            permBox.style.display = 'none';
        }
    });
    
    // Load initial data
    taskManager.renderTasks();
    analyticsManager.updateStats();
    calendarManager.renderCalendar();
    
    // Check notifications every minute
    setInterval(() => {
        if (stateManager.get('notificationEnabled')) {
            notificationManager.checkUpcomingTasks();
        }
    }, 60000);
    
    console.log('Task Manager App Initialized Successfully!');
});

// Global function for modal close
function closeModal() {
    if (window.app && window.app.taskManager) {
        window.app.taskManager.closeModal();
    }
}