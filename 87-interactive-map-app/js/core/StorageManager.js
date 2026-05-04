class StorageManager {
    static save(key, data) { try { localStorage.setItem(`map_${key}`, JSON.stringify(data)); return true; } catch(e){ return false; } }
    static load(key, def=null) { try { const saved = localStorage.getItem(`map_${key}`); return saved ? JSON.parse(saved) : def; } catch(e){ return def; } }
}
window.StorageManager = StorageManager;