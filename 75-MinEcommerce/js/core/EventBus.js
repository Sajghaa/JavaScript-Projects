export class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Set();
    }

    // Subscribe to event
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        
        return () => this.off(event, callback);
    }

    // Subscribe once
    once(event, callback) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback);
            callback(...args);
        };
        this.onceEvents.add(onceCallback);
        this.on(event, onceCallback);
    }

    // Unsubscribe
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
            if (this.onceEvents.has(callback)) {
                this.onceEvents.delete(callback);
            }
        }
    }

    // Emit event
    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // Clear all listeners
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
            this.onceEvents.clear();
        }
    }

    // Get listener count
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).size : 0;
    }

    // Get all event names
    eventNames() {
        return Array.from(this.events.keys());
    }

    // Wait for event (Promise)
    waitFor(event, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off(event, handler);
                reject(new Error(`Timeout waiting for event: ${event}`));
            }, timeout);

            const handler = (data) => {
                clearTimeout(timeoutId);
                resolve(data);
            };

            this.once(event, handler);
        });
    }

    // Create event channel
    channel(namespace) {
        return {
            on: (event, callback) => this.on(`${namespace}:${event}`, callback),
            once: (event, callback) => this.once(`${namespace}:${event}`, callback),
            off: (event, callback) => this.off(`${namespace}:${event}`, callback),
            emit: (event, data) => this.emit(`${namespace}:${event}`, data)
        };
    }
}