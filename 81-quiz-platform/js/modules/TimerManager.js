class TimerManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.timer = null;
        this.timeLeft = 0;
        this.startTime = 0;
        this.isRunning = false;
    }

    startTimer(seconds, onTimeout) {
        this.stopTimer();
        this.timeLeft = seconds;
        this.startTime = Date.now();
        this.isRunning = true;
        this.onTimeout = onTimeout;
        
        this.updateDisplay();
        
        this.timer = setInterval(() => {
            if (this.isRunning) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                this.timeLeft = seconds - elapsed;
                
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.updateDisplay();
                    this.stopTimer();
                    if (this.onTimeout) this.onTimeout();
                } else {
                    this.updateDisplay();
                }
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
    }

    updateDisplay() {
        const display = document.getElementById('timeLeft');
        const container = document.getElementById('timerDisplay');
        
        if (display) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning class when time is low
            if (this.timeLeft <= 10 && this.timeLeft > 0) {
                container.classList.add('warning');
            } else {
                container.classList.remove('warning');
            }
        }
    }

    getTimeSpent() {
        if (this.startTime) {
            return Math.floor((Date.now() - this.startTime) / 1000);
        }
        return 0;
    }
}

window.TimerManager = TimerManager;