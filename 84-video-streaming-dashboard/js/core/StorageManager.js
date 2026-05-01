class StorageManager {
    static save(key, data) { try { localStorage.setItem(`video_${key}`, JSON.stringify(data)); return true; } catch(e){ return false; } }
    static load(key, def=null) { try { const saved = localStorage.getItem(`video_${key}`); return saved ? JSON.parse(saved) : def; } catch(e){ return def; } }
    static remove(key) { localStorage.removeItem(`video_${key}`); }
}
window.StorageManager = StorageManager;