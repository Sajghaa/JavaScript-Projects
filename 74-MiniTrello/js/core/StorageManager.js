export class StorageManager {
    static prefix = 'trello_';
    static version = '1.0.0';

    // Save data
    static save(key, data) {
        try {
            const package_ = {
                version: this.version,
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(this.prefix + key, JSON.stringify(package_));
            return true;
        } catch (error) {
            console.error('Error saving:', error);
            return false;
        }
    }

    // Load data
    static load(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (!serialized) return defaultValue;
            
            const package_ = JSON.parse(serialized);
            return package_.data;
        } catch (error) {
            console.error('Error loading:', error);
            return defaultValue;
        }
    }

    // Remove data
    static remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Error removing:', error);
            return false;
        }
    }

    // Check if key exists
    static has(key) {
        return localStorage.getItem(this.prefix + key) !== null;
    }

    // Get all keys
    static keys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    // Get all data
    static getAll() {
        const data = {};
        this.keys().forEach(key => {
            data[key] = this.load(key);
        });
        return data;
    }

    // Clear all app data
    static clear() {
        this.keys().forEach(key => {
            localStorage.removeItem(this.prefix + key);
        });
    }

    // Get storage usage
    static getUsage() {
        let total = 0;
        this.keys().forEach(key => {
            const value = localStorage.getItem(this.prefix + key);
            total += value ? value.length : 0;
        });
        return {
            bytes: total,
            kb: (total / 1024).toFixed(2),
            mb: (total / 1024 / 1024).toFixed(2)
        };
    }

    // Export all data
    static exportData() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trello-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data
    static async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    Object.entries(data).forEach(([key, value]) => {
                        this.save(key, value);
                    });
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Migrate old data
    static migrate() {
        const keys = this.keys();
        keys.forEach(key => {
            const value = localStorage.getItem(this.prefix + key);
            if (value && !value.includes('version')) {
                // Old format, migrate
                this.save(key, JSON.parse(value));
            }
        });
    }
}