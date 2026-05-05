class GameEngine {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 100;
    }

    start() {
        if(this.gameLoop) clearInterval(this.gameLoop);
        this.isRunning = true;
        this.isPaused = false;
        this.gameLoop = setInterval(() => {
            if(!this.isPaused && this.isRunning) {
                this.eventBus.emit('game:tick');
            }
        }, this.speed);
    }

    pause() {
        if(this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.eventBus.emit('game:paused');
        }
    }

    resume() {
        if(this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.eventBus.emit('game:resumed');
        }
    }

    stop() {
        if(this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.isRunning = false;
        this.isPaused = false;
    }

    setSpeed(speed) {
        this.speed = speed;
        if(this.isRunning && !this.isPaused) {
            this.stop();
            this.start();
        }
    }
}
window.GameEngine = GameEngine;