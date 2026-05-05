class SnakeModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('game:tick', () => this.move());
    }

    move() {
        const snake = [...this.stateManager.get('snake')];
        const direction = this.stateManager.get('nextDirection');
        const currentDir = this.stateManager.get('direction');
        
        // Prevent 180-degree turns
        if((direction === 'RIGHT' && currentDir === 'LEFT') ||
           (direction === 'LEFT' && currentDir === 'RIGHT') ||
           (direction === 'UP' && currentDir === 'DOWN') ||
           (direction === 'DOWN' && currentDir === 'UP')) {
            return;
        }
        
        this.stateManager.set('direction', direction);
        
        let newHead = [...snake[0]];
        switch(direction) {
            case 'RIGHT': newHead[0]++; break;
            case 'LEFT': newHead[0]--; break;
            case 'UP': newHead[1]--; break;
            case 'DOWN': newHead[1]++; break;
        }
        
        snake.unshift(newHead);
        
        const food = this.stateManager.get('food');
        if(newHead[0] === food[0] && newHead[1] === food[1]) {
            this.eventBus.emit('food:eaten');
        } else {
            snake.pop();
        }
        
        this.stateManager.set('snake', snake);
        this.checkCollision();
    }

    checkCollision() {
        const snake = this.stateManager.get('snake');
        const head = snake[0];
        const gridSize = this.stateManager.get('gridSize');
        
        // Wall collision
        if(head[0] < 0 || head[0] >= gridSize || head[1] < 0 || head[1] >= gridSize) {
            this.eventBus.emit('game:over');
            return;
        }
        
        // Self collision
        for(let i = 1; i < snake.length; i++) {
            if(head[0] === snake[i][0] && head[1] === snake[i][1]) {
                this.eventBus.emit('game:over');
                return;
            }
        }
    }

    changeDirection(newDir) { this.stateManager.set('nextDirection', newDir); }
}
window.SnakeModule = SnakeModule;