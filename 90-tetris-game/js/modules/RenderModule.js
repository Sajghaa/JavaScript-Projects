class RenderModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 30;
        this.init();
    }

    init() {
        this.eventBus.on('game:tick', () => this.render());
        this.eventBus.on('piece:moved', () => this.render());
        this.eventBus.on('piece:rotated', () => this.render());
        this.eventBus.on('piece:merged', () => this.render());
        this.eventBus.on('game:reset', () => this.render());
        this.render();
    }

    render() {
        const board = this.stateManager.get('board');
        const piece = this.stateManager.get('currentPiece');
        const currentX = this.stateManager.get('currentX');
        const currentY = this.stateManager.get('currentY');
        
        this.ctx.clearRect(0, 0, 300, 600);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(100,100,100,0.1)';
        for(let i = 0; i <= 20; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * 30);
            this.ctx.lineTo(300, i * 30);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(i * 30, 0);
            this.ctx.lineTo(i * 30, 600);
            this.ctx.stroke();
        }
        
        // Draw board pieces
        for(let i = 0; i < board.length; i++) {
            for(let j = 0; j < board[i].length; j++) {
                if(board[i][j]) {
                    this.ctx.fillStyle = board[i][j];
                    this.ctx.fillRect(j * 30, i * 30, 28, 28);
                    // Add highlight effect
                    this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.fillRect(j * 30, i * 30, 28, 5);
                }
            }
        }
        
        // Draw current piece
        if(piece) {
            for(let i = 0; i < piece.shape.length; i++) {
                for(let j = 0; j < piece.shape[i].length; j++) {
                    if(piece.shape[i][j]) {
                        this.ctx.fillStyle = piece.color;
                        this.ctx.fillRect((currentX + j) * 30, (currentY + i) * 30, 28, 28);
                        this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                        this.ctx.fillRect((currentX + j) * 30, (currentY + i) * 30, 28, 5);
                    }
                }
            }
        }
    }
}
window.RenderModule = RenderModule;