class QueueManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.queueList = new QueueList(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderQueue();
        this.renderWatchLater();
        document.getElementById('queueToggleBtn').onclick = () => this.toggleQueue();
        document.getElementById('closeQueueBtn').onclick = () => this.closeQueue();
        document.getElementById('clearQueueBtn').onclick = () => this.clearQueue();
        document.getElementById('closeWatchLaterBtn').onclick = () => this.closeWatchLater();
        this.eventBus.on('video:queue', (id) => this.addToQueue(id));
        this.eventBus.on('video:watchlater', (id) => this.addToWatchLater(id));
    }

    addToQueue(id) {
        const video = this.stateManager.get('videos').find(v=>v.id===id);
        if(video) { this.stateManager.addToQueue(video); this.renderQueue(); this.eventBus.emit('toast', { message: 'Added to queue', type: 'success' }); }
    }

    removeFromQueue(id) { this.stateManager.removeFromQueue(id); this.renderQueue(); }

    clearQueue() { if(confirm('Clear entire queue?')) { this.stateManager.clearQueue(); this.renderQueue(); } }

    addToWatchLater(id) {
        const video = this.stateManager.get('videos').find(v=>v.id===id);
        if(video) { this.stateManager.addToWatchLater(video); this.renderWatchLater(); this.eventBus.emit('toast', { message: 'Added to Watch Later', type: 'success' }); }
    }

    removeFromWatchLater(id) { this.stateManager.removeFromWatchLater(id); this.renderWatchLater(); }

    renderQueue() {
        const container = document.getElementById('queueList');
        const queue = this.stateManager.get('queue');
        container.innerHTML = this.queueList.render(queue, 'queue');
        document.getElementById('queueCount').textContent = queue.length;
        container.querySelectorAll('.queue-remove').forEach(btn => { btn.onclick = () => this.removeFromQueue(btn.dataset.id); });
        container.querySelectorAll('.queue-item').forEach(item => { item.onclick = (e) => { if(!e.target.closest('.queue-remove')) this.eventBus.emit('video:select', item.dataset.id); }; });
    }

    renderWatchLater() {
        const container = document.getElementById('watchLaterList');
        const watchLater = this.stateManager.get('watchLater');
        container.innerHTML = this.queueList.render(watchLater, 'watch later');
        container.querySelectorAll('.queue-remove').forEach(btn => { btn.onclick = () => this.removeFromWatchLater(btn.dataset.id); });
        container.querySelectorAll('.queue-item').forEach(item => { item.onclick = (e) => { if(!e.target.closest('.queue-remove')) this.eventBus.emit('video:select', item.dataset.id); }; });
    }

    toggleQueue() { document.getElementById('queueSidebar').classList.toggle('open'); }
    closeQueue() { document.getElementById('queueSidebar').classList.remove('open'); }
    closeWatchLater() { document.getElementById('watchLaterSidebar').classList.remove('open'); }
}
window.QueueManager = QueueManager;