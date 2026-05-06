class BoardModule {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.init();
    }

    init() {
        this.eventBus.on('game:tick', () => this.moveDown());
        this.eventBus.on('piece:spawned', () => this.checkGameOver());
    }

    moveLeft() {
        const x = this.stateManager.get('currentX');
        this.stateManager.set('currentX', x - 1);
        if(this.checkCollision()) {
            this.stateManager.set('currentX', x);
        } else {
            this.eventBus.emit('piece:moved');
        }
    }

    moveRight() {
        const x = this.stateManager.get('currentX');
        this.stateManager.set('currentX', x + 1);
        if(this.checkCollision()) {
            this.stateManager.set('currentX', x);
        } else {
            this.eventBus.emit('piece:moved');
        }
    }

    moveDown() {
        const y = this.stateManager.get('currentY');
        this.stateManager.set('currentY', y + 1);
        if(this.checkCollision()) {
            this.stateManager.set('currentY', y);
            this.mergePiece();
            this.clearLines();
            this.eventBus.emit('piece:landed');
        } else {
            this.eventBus.emit('piece:moved');
        }
    }

    hardDrop() {
        while(!this.checkCollision()) {
            const y = this.stateManager.get('currentY');
            this.stateManager.set('currentY', y + 1);
        }
        const y = this.stateManager.get('currentY');
        this.stateManager.set('currentY', y - 1);
        this.mergePiece();
        this.clearLines();
        this.eventBus.emit('piece:landed');
    }

    checkCollision() {
        const piece = this.stateManager.get('currentPiece');
        const board = this.stateManager.get('board');
        const x = this.stateManager.get('currentX');
        const y = this.stateManager.get('currentY');
        
        for(let i = 0; i < piece.shape.length; i++) {
            for(let j = 0; j < piece.shape[i].length; j++) {
                if(piece.shape[i][j]) {
                    const boardX = x + j;
                    const boardY = y + i;
                    if(boardX < 0 || boardX >= 10 || boardY >= 20 || (boardY >= 0 && board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    mergePiece() {
        const piece = this.stateManager.get('currentPiece');
        const board = this.stateManager.get('board');
        const x = this.stateManager.get('currentX');
        const y = this.stateManager.get('currentY');
        
        for(let i = 0; i < piece.shape.length; i++) {
            for(let j = 0; j < piece.shape[i].length; j++) {
                if(piece.shape[i][j] && y + i >= 0) {
                    board[y + i][x + j] = piece.color;
                }
            }
        }
        this.stateManager.set('board', board);
        this.eventBus.emit('piece:merged');
    }

    clearLines() {
        const board = this.stateManager.get('board');
        let linesCleared = 0;
        
        for(let i = board.length - 1; i >= 0; i--) {
            if(board[i].every(cell => cell !== 0)) {
                board.splice(i, 1);
                board.unshift(Array(10).fill(0));
                linesCleared++;
                i++;
            }
        }
        
        if(linesCleared > 0) {
            this.stateManager.set('board', board);
            this.eventBus.emit('lines:cleared', linesCleared);
        }
    }

    checkGameOver() {
        const piece = this.stateManager.get('currentPiece');
        const board = this.stateManager.get('board');
        const x = this.stateManager.get('currentX');
        const y = this.stateManager.get('currentY');
        
        for(let i = 0; i < piece.shape.length; i++) {
            for(let j = 0; j < piece.shape[i].length; j++) {
                if(piece.shape[i][j] && board[y + i] && board[y + i][x + j]) {
                    this.eventBus.emit('game:over');
                    return true;
                }
            }
        }
        return false;
    }
}
window.BoardModule = BoardModule;