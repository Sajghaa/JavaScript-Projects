class QueueList {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
    }

    render(items, type = 'queue') {
        if(items.length === 0) return `<div class="empty-state">No items in ${type}</div>`;
        return items.map(item => `
            <div class="queue-item" data-id="${item.id}">
                <img src="${item.thumbnail}" class="queue-thumbnail" alt="${item.title}">
                <div class="queue-info">
                    <div class="queue-title">${this.escapeHtml(item.title)}</div>
                    <div class="queue-channel">${item.channel}</div>
                </div>
                <button class="queue-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    }

    escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
}
window.QueueList = QueueList;