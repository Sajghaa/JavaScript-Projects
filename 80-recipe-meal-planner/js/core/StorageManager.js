class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(`recipe_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(`recipe_${key}`);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Load error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        localStorage.removeItem(`recipe_${key}`);
    }

    static clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('recipe_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

window.StorageManager = StorageManager;