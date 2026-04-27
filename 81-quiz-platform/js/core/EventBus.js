class EventBus {
    constructor() { this.events = new Map(); }
    on(event, callback) {
        if (!this.events.has(event)) this.events.set(event, new Set());
        this.events.get(event).add(callback);
        return () => this.events.get(event)?.delete(callback);
    }
    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => { try { callback(data); } catch(e) { console.error(e); } });
        }
    }
}
window.EventBus = EventBus;