class FileManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.fileList = new FileList(stateManager, eventBus);
        this.init();
    }

    init() {
        this.renderFiles();
        this.eventBus.on('files:updated', () => this.renderFiles());
        this.eventBus.on('file:delete', (id) => this.deleteFile(id));
        this.eventBus.on('file:select', (id) => this.toggleSelect(id));
        this.eventBus.on('file:selectAll', () => this.selectAll());
        this.eventBus.on('file:clearSelection', () => this.clearSelection());
    }

    renderFiles() {
        const container = document.getElementById('filesGrid');
        const files = this.stateManager.getFilteredFiles();
        const selected = this.stateManager.get('selectedFiles');
        document.getElementById('filesCount').textContent = `${files.length} files`;
        if(files.length === 0) { container.innerHTML = ''; document.getElementById('emptyState').style.display = 'block'; return; }
        document.getElementById('emptyState').style.display = 'none';
        container.innerHTML = this.fileList.render(files, selected);
        this.attachEvents();
    }

    attachEvents() {
        document.querySelectorAll('.file-card').forEach(card => {
            card.onclick = (e) => { if(!e.target.closest('.file-action')) this.eventBus.emit('file:preview', parseInt(card.dataset.id)); };
        });
        document.querySelectorAll('.file-checkbox').forEach(cb => { cb.onchange = () => this.eventBus.emit('file:select', parseInt(cb.dataset.id)); });
        document.querySelectorAll('.edit-metadata').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); this.eventBus.emit('file:edit', parseInt(btn.dataset.id)); }; });
        document.querySelectorAll('.delete-file').forEach(btn => { btn.onclick = (e) => { e.stopPropagation(); if(confirm('Delete this file?')) this.eventBus.emit('file:delete', parseInt(btn.dataset.id)); }; });
    }

    async deleteFile(id) { const file = this.stateManager.getFile(id); if(file) { await window.storageService.deleteFile(id); this.stateManager.deleteFile(id); this.eventBus.emit('toast', { message: 'File deleted', type: 'success' }); } }

    toggleSelect(id) { let selected = [...this.stateManager.get('selectedFiles')]; if(selected.includes(id)) selected = selected.filter(s=>s!==id); else selected.push(id); this.stateManager.set('selectedFiles', selected); this.renderFiles(); }
    selectAll() { const files = this.stateManager.getFilteredFiles(); this.stateManager.set('selectedFiles', files.map(f=>f.id)); this.renderFiles(); }
    clearSelection() { this.stateManager.set('selectedFiles', []); this.renderFiles(); }
}
window.FileManager = FileManager;