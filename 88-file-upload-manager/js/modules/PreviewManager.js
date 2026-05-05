class PreviewManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.filePreview = new FilePreview(stateManager, eventBus);
        this.init();
    }

    init() { this.eventBus.on('file:preview', (id) => this.showPreview(id)); }

    async showPreview(id) {
        const file = this.stateManager.getFile(id);
        if(!file) return;
        const fileData = await window.storageService.getFile(id);
        const previewHtml = this.filePreview.render(file, fileData);
        document.getElementById('previewTitle').textContent = file.name;
        document.getElementById('previewBody').innerHTML = previewHtml;
        document.getElementById('previewModal').classList.add('active');
        document.getElementById('deleteFromPreviewBtn').onclick = () => { this.eventBus.emit('file:delete', id); this.closeModal(); };
        document.getElementById('downloadFileBtn').onclick = () => this.downloadFile(file, fileData);
    }

    downloadFile(file, data) { const a = document.createElement('a'); a.href = data; a.download = file.name; a.click(); }
    closeModal() { document.getElementById('previewModal').classList.remove('active'); }
}
window.PreviewManager = PreviewManager;