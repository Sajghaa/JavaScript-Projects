class EventBus {
    constructor() { this.events = new Map(); }
    on(event, cb) { if(!this.events.has(event)) this.events.set(event, new Set()); this.events.get(event).add(cb); return ()=>this.events.get(event)?.delete(cb); }
    emit(event, data) { if(this.events.has(event)) this.events.get(event).forEach(cb=>{ try{ cb(data); }catch(e){} }); }
}
window.EventBus = EventBus;