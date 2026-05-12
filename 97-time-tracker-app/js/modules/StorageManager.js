// StorageManager.js - Handles localStorage operations
class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(`timetracker_${key}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save error:', e);
            return false;
        }
    }
    
    static load(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(`timetracker_${key}`);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (e) {
            console.error('Load error:', e);
            return defaultValue;
        }
    }
    
    static remove(key) {
        localStorage.removeItem(`timetracker_${key}`);
    }
    
    static clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('timetracker_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

window.StorageManager = StorageManager;