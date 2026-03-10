export class StorageManager {
    static prefix = 'portfolio_';
    static version = '1.0.0';

    // Save data with options
    static save(key, data, options = {}) {
        try {
            let value = data;
            
            // Add metadata
            const package_ = {
                version: this.version,
                timestamp: Date.now(),
                data: value
            };

            // Compress if needed (for large data)
            if (options.compress && JSON.stringify(package_).length > 100000) {
                package_.compressed = true;
                package_.data = this.compress(JSON.stringify(value));
            }

            // Encrypt if needed (for sensitive data)
            if (options.encrypt) {
                package_.encrypted = true;
                package_.data = this.encrypt(JSON.stringify(package_.data));
            }

            const serialized = JSON.stringify(package_);
            localStorage.setItem(this.prefix + key, serialized);
            
            this.log(`Saved: ${key}`, 'success');
            return true;
        } catch (error) {
            this.log(`Error saving ${key}: ${error.message}`, 'error');
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded(key, data);
            }
            
            return false;
        }
    }

    // Load data with automatic decompression/decryption
    static load(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(this.prefix + key);
            if (serialized === null) return defaultValue;
            
            const package_ = JSON.parse(serialized);
            
            // Handle version migration
            if (package_.version && package_.version !== this.version) {
                return this.migrate(key, package_);
            }
            
            let data = package_.data;
            
            // Decompress if needed
            if (package_.compressed) {
                data = JSON.parse(this.decompress(data));
            }
            
            // Decrypt if needed
            if (package_.encrypted) {
                data = JSON.parse(this.decrypt(data));
            }
            
            return data;
        } catch (error) {
            this.log(`Error loading ${key}: ${error.message}`, 'error');
            return defaultValue;
        }
    }

    // Remove item
    static remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            this.log(`Removed: ${key}`, 'info');
            return true;
        } catch (error) {
            this.log(`Error removing ${key}: ${error.message}`, 'error');
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
        try {
            this.keys().forEach(key => {
                localStorage.removeItem(this.prefix + key);
            });
            this.log('All data cleared', 'warning');
            return true;
        } catch (error) {
            this.log(`Error clearing data: ${error.message}`, 'error');
            return false;
        }
    }

    // Get storage usage statistics
    static getStats() {
        let totalBytes = 0;
        const items = [];
        
        this.keys().forEach(key => {
            const value = localStorage.getItem(this.prefix + key);
            const bytes = value ? value.length : 0;
            totalBytes += bytes;
            items.push({
                key,
                size: this.formatBytes(bytes),
                bytes
            });
        });

        return {
            totalSize: this.formatBytes(totalBytes),
            totalBytes,
            itemCount: items.length,
            items: items.sort((a, b) => b.bytes - a.bytes),
            quota: this.getQuotaInfo()
        };
    }

    // Format bytes to human readable
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get quota information (browser dependent)
    static getQuotaInfo() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return navigator.storage.estimate().then(estimate => ({
                usage: this.formatBytes(estimate.usage),
                quota: this.formatBytes(estimate.quota),
                percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%'
            }));
        }
        return { available: 'Unknown (browser does not support quota estimation)' };
    }

    // Handle quota exceeded error
    static handleQuotaExceeded(key, data) {
        this.log('Storage quota exceeded. Attempting cleanup...', 'warning');
        
        // Get all items sorted by last accessed
        const items = this.keys().map(k => {
            const package_ = JSON.parse(localStorage.getItem(this.prefix + k) || '{}');
            return {
                key: k,
                timestamp: package_.timestamp || 0,
                size: localStorage.getItem(this.prefix + k)?.length || 0
            };
        }).sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest items until we have space
        let freed = 0;
        while (items.length > 0 && freed < 100000) { // Try to free 100KB
            const oldest = items.shift();
            this.remove(oldest.key);
            freed += oldest.size;
        }

        this.log(`Freed ${this.formatBytes(freed)}. Retrying save...`, 'info');
        
        // Retry saving
        return this.save(key, data);
    }

    // Simple compression (for demo - use lz-string in production)
    static compress(str) {
        // Simple base64 encoding as placeholder
        // In production, use a proper compression library like lz-string
        return btoa(unescape(encodeURIComponent(str)));
    }

    // Simple decompression
    static decompress(str) {
        // Simple base64 decoding as placeholder
        return decodeURIComponent(escape(atob(str)));
    }

    // Simple encryption (for demo - use proper crypto in production)
    static encrypt(str) {
        // Simple XOR cipher as placeholder (DO NOT USE IN PRODUCTION!)
        const key = 'portfolio-secret-key';
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    }

    // Simple decryption
    static decrypt(str) {
        const key = 'portfolio-secret-key';
        const decoded = atob(str);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }

    // Migrate data from older versions
    static migrate(key, oldPackage) {
        this.log(`Migrating ${key} from version ${oldPackage.version} to ${this.version}`, 'info');
        
        let data = oldPackage.data;
        
        // Version-specific migrations
        switch(oldPackage.version) {
            case '0.9.0':
                // Migrate from beta version
                data = this.migrateFromBeta(data);
                break;
            case '0.9.5':
                // Migrate from pre-release
                data = this.migrateFromPrerelease(data);
                break;
        }

        // Resave with new version
        this.save(key, data);
        return data;
    }

    static migrateFromBeta(data) {
        // Example migration: restructure data format
        if (data.sections) {
            data.sections = data.sections.map(section => ({
                ...section,
                visible: section.visible !== false,
                data: section.data || {}
            }));
        }
        return data;
    }

    static migrateFromPrerelease(data) {
        // Example migration: add new fields
        if (data.theme) {
            data.theme.animations = data.theme.animations !== false;
        }
        return data;
    }

    // Export all data as JSON file
    static exportData() {
        const data = this.getAll();
        const exportData = {
            version: this.version,
            timestamp: Date.now(),
            data: data
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('Data exported successfully', 'success');
    }

    // Import data from JSON file
    static async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // Validate import format
                    if (!imported.version || !imported.data) {
                        throw new Error('Invalid backup file format');
                    }

                    // Clear existing data
                    this.clear();
                    
                    // Import each key
                    Object.entries(imported.data).forEach(([key, value]) => {
                        this.save(key, value);
                    });
                    
                    this.log('Data imported successfully', 'success');
                    resolve(true);
                } catch (error) {
                    this.log(`Import failed: ${error.message}`, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    // Backup to cloud (placeholder)
    static async backupToCloud(provider = 'local') {
        this.log(`Backing up to ${provider}...`, 'info');
        
        // In production, implement actual cloud backup
        // This could use APIs for Google Drive, Dropbox, etc.
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.log(`Backup to ${provider} completed`, 'success');
                resolve(true);
            }, 1000);
        });
    }

    // Restore from cloud
    static async restoreFromCloud(provider = 'local') {
        this.log(`Restoring from ${provider}...`, 'info');
        
        // In production, implement actual cloud restore
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.log(`Restore from ${provider} completed`, 'success');
                resolve(true);
            }, 1000);
        });
    }

    // Auto-save functionality
    static autoSave(key, data, interval = 30000) {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.save(key, data);
            this.log(`Auto-saved: ${key}`, 'info');
        }, interval);
        
        return this.autoSaveTimer;
    }

    // Stop auto-save
    static stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    // Watch for changes in other tabs
    static watch(key, callback) {
        window.addEventListener('storage', (e) => {
            if (e.key === this.prefix + key) {
                const newValue = e.newValue ? JSON.parse(e.newValue).data : null;
                callback(newValue);
            }
        });
    }

    // Create a backup before major changes
    static createSnapshot(key) {
        const data = this.load(key);
        const snapshotKey = `${key}_snapshot_${Date.now()}`;
        this.save(snapshotKey, data);
        return snapshotKey;
    }

    // Restore from snapshot
    static restoreSnapshot(snapshotKey, targetKey) {
        const snapshot = this.load(snapshotKey);
        if (snapshot) {
            this.save(targetKey, snapshot);
            this.remove(snapshotKey);
            return true;
        }
        return false;
    }

    // Get change history for a key
    static getHistory(key) {
        const history = [];
        const keys = this.keys();
        
        keys.filter(k => k.startsWith(`${key}_history_`)).sort().forEach(historyKey => {
            history.push({
                timestamp: parseInt(historyKey.split('_').pop()),
                data: this.load(historyKey)
            });
        });
        
        return history;
    }

    // Log with emoji indicators
    static log(message, type = 'info') {
        const icons = {
            info: '📘',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        console.log(`${icons[type] || '📘'} [StorageManager] ${message}`);
    }

    // Get storage status summary
    static getStatus() {
        const stats = this.getStats();
        return {
            healthy: stats.totalBytes < 5 * 1024 * 1024, // Less than 5MB
            items: stats.itemCount,
            totalSize: stats.totalSize,
            largestItems: stats.items.slice(0, 3),
            recommendation: this.getStorageRecommendation(stats)
        };
    }

    // Get storage recommendation
    static getStorageRecommendation(stats) {
        if (stats.totalBytes > 4.5 * 1024 * 1024) {
            return 'Storage almost full. Consider exporting and clearing old data.';
        } else if (stats.totalBytes > 2 * 1024 * 1024) {
            return 'Storage usage is moderate. Regular backups recommended.';
        } else {
            return 'Storage usage is healthy.';
        }
    }

    // Initialize with default data if empty
    static initializeWithDefaults(key, defaults) {
        if (!this.has(key)) {
            this.save(key, defaults);
            this.log(`Initialized ${key} with defaults`, 'info');
            return defaults;
        }
        return this.load(key);
    }

    // Merge with existing data
    static merge(key, newData, options = {}) {
        const existing = this.load(key, {});
        const merged = options.deep ? this.deepMerge(existing, newData) : { ...existing, ...newData };
        this.save(key, merged);
        return merged;
    }

    // Deep merge objects
    static deepMerge(target, source) {
        const output = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!output[key]) {
                    output[key] = {};
                }
                output[key] = this.deepMerge(output[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
        
        return output;
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

export default StorageManager;