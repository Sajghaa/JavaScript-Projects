class Timer {
    constructor() {
        this.seconds = 0;
        this.interval = null;
        this.isRunning = false;
        this.callbacks = {};
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
            this.trigger('tick', this.seconds);
        }, 1000);
        
        this.trigger('start', this.seconds);
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.trigger('pause', this.seconds);
    }
    
    stop() {
        this.pause();
        const finalSeconds = this.seconds;
        this.reset();
        this.trigger('stop', finalSeconds);
        return finalSeconds;
    }
    
    reset() {
        this.seconds = 0;
        this.updateDisplay();
        this.trigger('reset', 0);
    }
    
    getTime() {
        return this.seconds;
    }
    
    getFormattedTime() {
        const hours = Math.floor(this.seconds / 3600);
        const minutes = Math.floor((this.seconds % 3600) / 60);
        const secs = this.seconds % 60;
        
        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0'),
            totalHours: hours + minutes / 60 + secs / 3600
        };
    }
    
    updateDisplay() {
        const time = this.getFormattedTime();
        const hoursEl = document.getElementById('timerHours');
        const minutesEl = document.getElementById('timerMinutes');
        const secondsEl = document.getElementById('timerSeconds');
        
        if (hoursEl) hoursEl.textContent = time.hours;
        if (minutesEl) minutesEl.textContent = time.minutes;
        if (secondsEl) secondsEl.textContent = time.seconds;
    }
    
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }
    
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }
}

window.Timer = Timer;