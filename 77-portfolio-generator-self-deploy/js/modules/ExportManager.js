class ExportManager {
    constructor(stateManager, eventBus, previewManager) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.previewManager = previewManager;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.eventBus.on('export:download', () => this.downloadPortfolio());
        this.eventBus.on('export:copyLink', () => this.copyPreviewLink());
    }

    downloadPortfolio() {
        const previewFrame = document.getElementById('previewFrame');
        const html = previewFrame.contentDocument.documentElement.outerHTML;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${this.stateManager.get('personal.name').toLowerCase().replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.eventBus.emit('notification', {
            message: 'Portfolio downloaded!',
            type: 'success'
        });
    }

    copyPreviewLink() {
        const previewFrame = document.getElementById('previewFrame');
        const html = previewFrame.contentDocument.documentElement.outerHTML;
        const dataUrl = 'data:text/html,' + encodeURIComponent(html);
        
        navigator.clipboard.writeText(dataUrl).then(() => {
            this.eventBus.emit('notification', {
                message: 'Preview link copied to clipboard!',
                type: 'success'
            });
        }).catch(() => {
            this.eventBus.emit('notification', {
                message: 'Failed to copy link',
                type: 'error'
            });
        });
    }
}

window.ExportManager = ExportManager;