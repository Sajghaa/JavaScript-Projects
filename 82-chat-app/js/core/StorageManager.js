class StorageManager {
    static save(key, data) {
        try { localStorage.setItem(`chat_${key}`, JSON.stringify(data)); return true; }
        catch (e) { console.error(e); return false; }
    }

    static load(key, defaultValue = null) {
        try { const saved = localStorage.getItem(`chat_${key}`); return saved ? JSON.parse(saved) : defaultValue; }
        catch (e) { console.error(e); return defaultValue; }
    }

    static remove(key) { localStorage.removeItem(`chat_${key}`); }
    static clear() { Object.keys(localStorage).forEach(k => k.startsWith('chat_') && localStorage.removeItem(k)); }
}

window.StorageManager = StorageManager;