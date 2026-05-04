document.addEventListener('DOMContentLoaded', async function() {
    const stateManager = new StateManager();
    const eventBus = new EventBus();
    const storageService = new StorageService();
    window.storageService = storageService;
    
    await storageService.initDB();
    
    const fileManager = new FileManager(stateManager, eventBus);
    const uploadManager = new UploadManager(stateManager, eventBus);
    const previewManager = new PreviewManager(stateManager, eventBus);
    const metadataManager = new MetadataManager(stateManager, eventBus);
    const fileFilters = new FileFilters(stateManager, eventBus);
    
    window.app = { stateManager, eventBus, fileManager, uploadManager, previewManager, metadataManager };
    
    // Load files from IndexedDB on startup
    const savedFiles = stateManager.get('files');
    for(const file of savedFiles) {
        const fileData = await storageService.getFile(file.id);
        if(fileData) file.data = fileData;
    }
    
    eventBus.on('toast', ({message,type}) => { const toast = document.getElementById('toast'); toast.textContent = message; toast.className = `toast ${type} show`; setTimeout(()=>toast.classList.remove('show'), 3000); });
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').onclick = () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };
    
    uploadManager.updateStorageDisplay();
    console.log('File Upload Manager Ready!');
});
window.closeModal = function() { document.querySelectorAll('.modal').forEach(m=>m.classList.remove('active')); };