class TetrominoModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.pieces = {
            'I': [[1,1,1,1]],
            'O': [[1,1],[1,1]],
            'T': [[0,1,0],[1,1,1]],
            'S': [[0,1,1],[1,1,0]],
            'Z': [[1,1,0],[0,1,1]],
            'L': [[1,0,0],[1,1,1]],
            'J': [[0,0,1],[1,1,1]]
        };
        this.colors = {
            'I': '#06b6d4',
            'O': '#f59e0b',
            'T': '#8b5cf6',
            'S': '#10b981',
            'Z': '#ef4444',
            'L': '#f97316',
            'J': '#3b82f6'
        };
        this.init();
    }

    init() {
        this.spawnNewPiece();
        this.eventBus.on('game:reset', () => this.spawnNewPiece());
    }

    spawnNewPiece() {
        const pieces = Object.keys(this.pieces);
        const currentType = pieces[Math.floor(Math.random() * pieces.length)];
        const nextType = pieces[Math.floor(Math.random() * pieces.length)];
        
        const currentPiece = {
            type: currentType,
            shape: this.pieces[currentType].map(row => [...row]),
            color: this.colors[currentType]
        };
        
        const nextPiece = {
            type: nextType,
            shape: this.pieces[nextType].map(row => [...row]),
            color: this.colors[nextType]
        };
        
        this.stateManager.set('currentPiece', currentPiece);
        this.stateManager.set('nextPiece', nextPiece);
        this.stateManager.set('currentX', 3);
        this.stateManager.set('currentY', 0);
        
        this.eventBus.emit('piece:spawned');
    }

    rotatePiece() {
        const piece = this.stateManager.get('currentPiece');
        if(!piece) return;
        
        const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
        const originalShape = piece.shape;
        piece.shape = rotated;
        
        if(this.eventBus.emit('piece:collision', piece)) {
            piece.shape = originalShape;
        } else {
            this.stateManager.set('currentPiece', piece);
            this.eventBus.emit('piece:rotated');
        }
    }

    getNextPiece() { return this.stateManager.get('nextPiece'); }
}
window.TetrominoModule = TetrominoModule;