class FoodModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('food:eaten', () => this.spawnFood());
        this.eventBus.on('game:reset', () => this.spawnFood());
    }

    spawnFood() {
        const snake = this.stateManager.get('snake');
        const gridSize = this.stateManager.get('gridSize');
        let newFood;
        let attempts = 0;
        const maxAttempts = 1000;
        
        do {
            newFood = [Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)];
            attempts++;
            if(attempts > maxAttempts) break;
        } while(snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
        
        this.stateManager.set('food', newFood);
        this.eventBus.emit('food:spawned', newFood);
    }
}
window.FoodModule = FoodModule;