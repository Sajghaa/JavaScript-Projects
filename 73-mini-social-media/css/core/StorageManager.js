export class StorageManager {
    static prefix = 'social_';
    static version = '1.0.0';

    // Save data with metadata
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
        const data = {
            version: this.version,
            timestamp: Date.now(),
            data: this.getAll()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `social-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data
    static async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    if (!imported.version || !imported.data) {
                        throw new Error('Invalid backup file');
                    }
                    
                    this.clear();
                    
                    Object.entries(imported.data).forEach(([key, value]) => {
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

    // Initialize with sample data
    static initializeWithSampleData() {
        const sampleUsers = [
            {
                id: 'user_1',
                name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                avatar: 'https://via.placeholder.com/40x40',
                bio: 'Software developer passionate about coding',
                location: 'San Francisco, CA',
                website: 'https://johndoe.com',
                followers: 150,
                following: 120,
                posts: 45,
                verified: true,
                createdAt: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'user_2',
                name: 'Jane Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                avatar: 'https://via.placeholder.com/40x40',
                bio: 'Designer & Artist',
                location: 'New York, NY',
                website: 'https://janesmith.design',
                followers: 230,
                following: 180,
                posts: 67,
                verified: false,
                createdAt: '2024-01-02T00:00:00.000Z'
            }
        ];

        const samplePosts = [
            {
                id: 'post_1',
                userId: 'user_1',
                content: 'Just launched my new portfolio website! Check it out! #webdev #portfolio',
                image: 'https://via.placeholder.com/600x400',
                likes: 42,
                comments: 7,
                retweets: 3,
                createdAt: '2024-03-10T10:00:00.000Z',
                isLiked: false,
                isRetweeted: false,
                isBookmarked: false
            },
            {
                id: 'post_2',
                userId: 'user_2',
                content: 'Working on a new design project. Excited to share it soon! #design #creative',
                image: null,
                likes: 28,
                comments: 4,
                retweets: 1,
                createdAt: '2024-03-09T15:30:00.000Z',
                isLiked: false,
                isRetweeted: false,
                isBookmarked: false
            }
        ];

        this.save('users', sampleUsers);
        this.save('posts', samplePosts);
    }

    // Backup to cloud (placeholder)
    static async backupToCloud(provider = 'gdrive') {
        const data = this.exportData();
        // Implement cloud backup API here
        console.log(`Backing up to ${provider}...`);
        return true;
    }

    // Restore from cloud (placeholder)
    static async restoreFromCloud(provider = 'gdrive') {
        // Implement cloud restore API here
        console.log(`Restoring from ${provider}...`);
        return true;
    }

    // Migrate old data format
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