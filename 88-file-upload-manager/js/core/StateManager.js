class StateManager {
    constructor() {
        this.state = {
            files: [],
            selectedFiles: [],
            filters: { search: '', type: 'all', sortBy: 'date' },
            storageLimit: 50 * 1024 * 1024, // 50MB
            totalSize: 0
        };
        this.listeners = new Map();
        this.loadFromStorage();
    }

    get(path) { return path.split('.').reduce((o,k)=>o?.[k], this.state); }
    set(path, value) {
        const keys = path.split('.'), last = keys.pop(), target = keys.reduce((o,k)=>o[k], this.state);
        target[last] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    subscribe(path, cb) { if(!this.listeners.has(path)) this.listeners.set(path, new Set()); this.listeners.get(path).add(cb); return ()=>this.listeners.get(path)?.delete(cb); }
    notifyListeners(path, val) { if(this.listeners.has(path)) this.listeners.get(path).forEach(cb=>cb(val)); }

    addFile(file) { this.state.files.push(file); this.updateTotalSize(); this.notifyListeners('files', this.state.files); this.saveToStorage(); }
    updateFile(id, updates) { const idx = this.state.files.findIndex(f=>f.id===id); if(idx!==-1) { this.state.files[idx] = {...this.state.files[idx], ...updates}; this.notifyListeners('files', this.state.files); this.saveToStorage(); return true; } return false; }
    deleteFile(id) { this.state.files = this.state.files.filter(f=>f.id!==id); this.updateTotalSize(); this.notifyListeners('files', this.state.files); this.saveToStorage(); }
    getFile(id) { return this.state.files.find(f=>f.id===id); }

    updateTotalSize() { this.state.totalSize = this.state.files.reduce((sum,f)=>sum + f.size, 0); this.notifyListeners('totalSize', this.state.totalSize); }
    getStoragePercent() { return (this.state.totalSize / this.state.storageLimit) * 100; }

    getFilteredFiles() {
        let files = [...this.state.files];
        if(this.state.filters.search) files = files.filter(f=>f.name.toLowerCase().includes(this.state.filters.search.toLowerCase()));
        if(this.state.filters.type !== 'all') files = files.filter(f=>f.typeCategory === this.state.filters.type);
        if(this.state.filters.sortBy === 'name') files.sort((a,b)=>a.name.localeCompare(b.name));
        else if(this.state.filters.sortBy === 'size') files.sort((a,b)=>b.size - a.size);
        else if(this.state.filters.sortBy === 'type') files.sort((a,b)=>a.typeCategory.localeCompare(b.typeCategory));
        else files.sort((a,b)=>new Date(b.uploadDate) - new Date(a.uploadDate));
        return files;
    }

    saveToStorage() { try { localStorage.setItem('file_manager_state', JSON.stringify({ files: this.state.files })); } catch(e){} }
    loadFromStorage() { try { const saved = localStorage.getItem('file_manager_state'); if(saved) { const data = JSON.parse(saved); this.state.files = data.files || []; this.updateTotalSize(); } } catch(e){} }
}
window.StateManager = StateManager;