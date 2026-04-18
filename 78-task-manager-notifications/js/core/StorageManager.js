class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(`task_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(`task_${key}`);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Load error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        localStorage.removeItem(`task_${key}`);
    }

    static clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('task_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

window.StorageManager = StorageManager;