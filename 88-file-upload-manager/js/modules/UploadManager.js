class UploadManager {
    constructor(stateManager, eventBus) {
        this.stateManager = stateManager;
        this.eventBus = eventBus;
        this.uploadArea = new UploadArea(stateManager, eventBus);
        this.init();
    }

    init() {
        document.getElementById('uploadBtn').onclick = () => document.getElementById('fileInput').click();
        document.getElementById('fileInput').onchange = (e) => this.handleFiles(e.target.files);
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); };
        dropZone.ondragleave = () => dropZone.classList.remove('drag-over');
        dropZone.ondrop = (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); this.handleFiles(e.dataTransfer.files); };
        dropZone.onclick = () => document.getElementById('fileInput').click();
    }

    async handleFiles(files) {
        const totalSize = this.stateManager.get('totalSize');
        const limit = this.stateManager.get('storageLimit');
        for(const file of Array.from(files)) {
            if(totalSize + file.size > limit) { this.eventBus.emit('toast', { message: 'Storage limit reached', type: 'error' }); continue; }
            await this.uploadFile(file);
        }
        this.eventBus.emit('files:updated');
    }

    async uploadFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const fileData = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type,
                typeCategory: this.getCategory(file.type),
                data: e.target.result,
                uploadDate: new Date().toISOString(),
                tags: [],
                description: '',
                category: 'uncategorized'
            };
            await window.storageService.saveFile(fileData.id, fileData.data);
            this.stateManager.addFile(fileData);
            this.eventBus.emit('toast', { message: `${file.name} uploaded`, type: 'success' });
            this.updateStorageDisplay();
        };
        reader.readAsDataURL(file);
    }

    getCategory(type) {
        if(type.startsWith('image/')) return 'image';
        if(type.startsWith('video/')) return 'video';
        if(type.startsWith('audio/')) return 'audio';
        return 'document';
    }

    updateStorageDisplay() {
        const total = this.stateManager.get('totalSize');
        const percent = this.stateManager.getStoragePercent();
        const limit = this.stateManager.get('storageLimit');
        document.getElementById('storageFill').style.width = `${Math.min(percent,100)}%`;
        document.getElementById('storageText').textContent = `${(total/1024/1024).toFixed(1)} MB / ${(limit/1024/1024).toFixed(0)} MB`;
    }
}
window.UploadManager = UploadManager;