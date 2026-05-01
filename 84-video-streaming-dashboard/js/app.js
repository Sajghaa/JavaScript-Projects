document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const videoManager = new VideoManager(stateManager, eventBus);
    const queueManager = new QueueManager(stateManager, eventBus);
    const playerManager = new PlayerManager(stateManager, eventBus);
    const categoryManager = new CategoryManager(stateManager, eventBus);
    const searchManager = new SearchManager(stateManager, eventBus);
    
    window.app = { stateManager, eventBus, videoManager, queueManager, playerManager };
    
    eventBus.on('toast', ({message,type}) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(()=>toast.classList.remove('show'), 3000);
    });
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    console.log('Video Streaming Dashboard Ready!');
});