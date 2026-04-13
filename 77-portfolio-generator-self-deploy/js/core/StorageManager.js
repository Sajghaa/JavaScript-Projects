class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Save error:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(`portfolio_${key}`);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.error('Load error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        localStorage.removeItem(`portfolio_${key}`);
    }

    static clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('portfolio_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

window.StorageManager = StorageManager;