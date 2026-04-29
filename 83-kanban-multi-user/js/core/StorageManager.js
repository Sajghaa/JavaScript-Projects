class StorageManager {
    static save(key, data) {
        try { localStorage.setItem(`kanban_${key}`, JSON.stringify(data)); return true; }
        catch (e) { console.error(e); return false; }
    }

    static load(key, defaultValue = null) {
        try { const saved = localStorage.getItem(`kanban_${key}`); return saved ? JSON.parse(saved) : defaultValue; }
        catch (e) { console.error(e); return defaultValue; }
    }

    static remove(key) { localStorage.removeItem(`kanban_${key}`); }
    static clear() { Object.keys(localStorage).forEach(k => k.startsWith('kanban_') && localStorage.removeItem(k)); }
}

window.StorageManager = StorageManager;