class RenderModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cellSize = 30;
        this.init();
    }

    init() {
        this.eventBus.on('game:tick', () => this.render());
        this.eventBus.on('game:reset', () => this.render());
        this.eventBus.on('food:spawned', () => this.render());
        this.render();
    }

    render() {
        const snake = this.stateManager.get('snake');
        const food = this.stateManager.get('food');
        
        this.ctx.clearRect(0, 0, 600, 600);
        
        // Draw grid - subtle
        this.ctx.strokeStyle = 'rgba(100,100,100,0.1)';
        for(let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, 600);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(600, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Draw food with glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#10b981';
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(food[0] * this.cellSize + this.cellSize/2, food[1] * this.cellSize + this.cellSize/2, this.cellSize/2 - 2, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw snake with gradient
        for(let i = 0; i < snake.length; i++) {
            const gradient = this.ctx.createLinearGradient(
                snake[i][0] * this.cellSize, 
                snake[i][1] * this.cellSize,
                snake[i][0] * this.cellSize + this.cellSize,
                snake[i][1] * this.cellSize + this.cellSize
            );
            if(i === 0) {
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#059669');
            } else {
                gradient.addColorStop(0, '#34d399');
                gradient.addColorStop(1, '#10b981');
            }
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                snake[i][0] * this.cellSize + 1,
                snake[i][1] * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
            
            // Draw eyes on head
            if(i === 0) {
                this.ctx.fillStyle = 'white';
                const eyeSize = 4;
                const eyeOffset = 8;
                this.ctx.beginPath();
                this.ctx.arc(snake[0][0] * this.cellSize + eyeOffset, snake[0][1] * this.cellSize + eyeOffset, eyeSize, 0, Math.PI*2);
                this.ctx.arc(snake[0][0] * this.cellSize + this.cellSize - eyeOffset, snake[0][1] * this.cellSize + eyeOffset, eyeSize, 0, Math.PI*2);
                this.ctx.fill();
                this.ctx.fillStyle = '#1f2937';
                this.ctx.beginPath();
                this.ctx.arc(snake[0][0] * this.cellSize + eyeOffset, snake[0][1] * this.cellSize + eyeOffset, eyeSize/2, 0, Math.PI*2);
                this.ctx.arc(snake[0][0] * this.cellSize + this.cellSize - eyeOffset, snake[0][1] * this.cellSize + eyeOffset, eyeSize/2, 0, Math.PI*2);
                this.ctx.fill();
            }
        }
    }
}
window.RenderModule = RenderModule;