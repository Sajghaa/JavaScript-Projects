document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    
    // Initialize components
    const taskCard = new TaskCard(stateManager, eventBus);
    const taskModal = new TaskModal(stateManager, eventBus);
    const taskManager = new TaskManager(stateManager, eventBus, taskModal);
    const userManager = new UserManager(stateManager, eventBus);
    const dragDropManager = new DragDropManager(stateManager, eventBus, taskManager);
    const notificationManager = new NotificationManager(stateManager, eventBus);
    const boardManager = new BoardManager(stateManager, eventBus, taskManager, taskCard);
    
    window.app = {
        stateManager,
        eventBus,
        taskManager,
        userManager,
        boardManager,
        notificationManager
    };
    
    // Add task button
    document.getElementById('addTaskBtn').onclick = () => {
        eventBus.emit('task:add', 'todo');
    };
    
    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    };
    
    // Simulate active users (current user is always active)
    const currentUser = stateManager.getCurrentUser();
    if (currentUser) {
        stateManager.toggleActiveUser(currentUser.id, true);
    }
    
    console.log('Kanban Board Initialized!');
});

// Global close modal function
window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
};