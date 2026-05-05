class MetadataManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.eventBus.on('file:edit', (id) => this.editMetadata(id));
        document.getElementById('saveMetadataBtn').onclick = () => this.saveMetadata();
    }

    editMetadata(id) {
        this.currentEditId = id;
        const file = this.stateManager.getFile(id);
        if(file) {
            document.getElementById('editFileName').value = file.name;
            document.getElementById('editFileTags').value = (file.tags || []).join(', ');
            document.getElementById('editFileDescription').value = file.description || '';
            document.getElementById('editFileCategory').value = file.category || 'uncategorized';
            document.getElementById('editMetadataModal').classList.add('active');
        }
    }

    saveMetadata() {
        const updates = {
            name: document.getElementById('editFileName').value,
            tags: document.getElementById('editFileTags').value.split(',').map(t=>t.trim()).filter(t=>t),
            description: document.getElementById('editFileDescription').value,
            category: document.getElementById('editFileCategory').value
        };
        this.stateManager.updateFile(this.currentEditId, updates);
        this.eventBus.emit('files:updated');
        this.eventBus.emit('toast', { message: 'Metadata updated', type: 'success' });
        this.closeModal();
    }

    closeModal() { document.getElementById('editMetadataModal').classList.remove('active'); }
}
window.MetadataManager = MetadataManager;