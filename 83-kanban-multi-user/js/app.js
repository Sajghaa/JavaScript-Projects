document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const taskModal = new TaskModal(stateManager, eventBus);
    const taskCard = new TaskCard(stateManager, eventBus);
    const taskManager = new TaskManager(stateManager, eventBus, taskModal);
    const userManager = new UserManager(stateManager, eventBus);
    const notificationManager = new NotificationManager(stateManager, eventBus);
    const boardManager = new BoardManager(stateManager, eventBus, taskManager, taskCard);
    
    window.app = { stateManager, eventBus, taskManager, userManager, boardManager };
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    console.log('Kanban Board Ready!');
});
window.closeModal = function() { document.querySelectorAll('.modal').forEach(m=>m.classList.remove('active')); };