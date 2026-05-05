document.addEventListener('DOMContentLoaded', function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const gameEngine = new GameEngine(stateManager, eventBus);
    
    const snakeModule = new SnakeModule(stateManager, eventBus);
    const foodModule = new FoodModule(stateManager, eventBus);
    const scoreModule = new ScoreModule(stateManager, eventBus);
    const renderModule = new RenderModule(stateManager, eventBus);
    const inputModule = new InputModule(stateManager, eventBus);
    const scoreBoard = new ScoreBoard(stateManager, eventBus);
    const gameOverlay = new GameOverlay(stateManager, eventBus);
    const settingsPanel = new SettingsPanel(stateManager, eventBus, gameEngine);
    
    window.app = { stateManager, eventBus, gameEngine };
    
    // Game flow events
    eventBus.on('snake:direction', (dir) => snakeModule.changeDirection(dir));
    eventBus.on('game:togglePause', () => {
        if(gameEngine.isRunning && !gameEngine.isPaused) gameEngine.pause();
        else if(gameEngine.isRunning && gameEngine.isPaused) gameEngine.resume();
    });
    eventBus.on('game:restart', () => {
        stateManager.resetGame();
        foodModule.spawnFood();
        gameEngine.stop();
        gameEngine.start();
        eventBus.emit('game:reset');
    });
    eventBus.on('game:over', () => {
        gameEngine.stop();
        eventBus.emit('stats:updated');
    });
    
    eventBus.on('toast', ({message,type}) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(()=>toast.classList.remove('show'), 2000);
    });
    
    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        eventBus.emit('toast', { message: `${newTheme} mode activated`, type: 'success' });
    };
    
    // Start game
    stateManager.resetGame();
    foodModule.spawnFood();
    gameEngine.start();
    
    console.log('Snake Game Ready!');
});