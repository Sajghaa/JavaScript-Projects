class NextPiece {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.canvas = document.getElementById('nextCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 25;
        this.init();
    }

    init() {
        this.eventBus.on('piece:spawned', () => this.render());
        this.eventBus.on('game:reset', () => this.render());
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, 120, 120);
        const nextPiece = this.stateManager.get('nextPiece');
        if(!nextPiece) return;
        
        const offsetX = (120 - (nextPiece.shape[0].length * this.cellSize)) / 2;
        const offsetY = (120 - (nextPiece.shape.length * this.cellSize)) / 2;
        
        for(let i = 0; i < nextPiece.shape.length; i++) {
            for(let j = 0; j < nextPiece.shape[i].length; j++) {
                if(nextPiece.shape[i][j]) {
                    this.ctx.fillStyle = nextPiece.color;
                    this.ctx.fillRect(offsetX + j * this.cellSize, offsetY + i * this.cellSize, this.cellSize - 2, this.cellSize - 2);
                }
            }
        }
    }
}
window.NextPiece = NextPiece;