export class EventBus {
    constructor() {
        this.events = new Map();
    }

    // Subscribe to event
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        
        return () => this.off(event, callback);
    }

    // Unsubscribe from event
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
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
    clear() {
        this.events.clear();
    }

    // Get listener count
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).size : 0;
    }
}