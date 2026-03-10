export class StateManager {
    constructor() {
        this.state = {
            portfolio: {
                personal: {
                    name: 'John Doe',
                    title: 'Full Stack Developer',
                    email: 'john@example.com',
                    phone: '+1 234 567 890',
                    location: 'New York, NY',
                    bio: 'Passionate developer with 5+ years of experience...',
                    avatar: null
                },
                sections: [],
                theme: {
                    name: 'modern',
                    primary: '#2563eb',
                    secondary: '#1e40af',
                    font: 'Inter',
                    layout: 'full',
                    animations: true
                },
                social: {
                    github: '',
                    linkedin: '',
                    twitter: '',
                    codepen: ''
                },
                seo: {
                    title: '',
                    description: ''
                }
            },
            ui: {
                activeTab: 'sections',
                activeSection: null,
                activeElement: null,
                device: 'desktop',
                previewMode: 'live'
            },
            history: {
                past: [],
                future: []
            }
        };
        
        this.listeners = new Map();
        this.batchMode = false;
        this.batchUpdates = [];
        this.loadFromStorage();
    }

    // Get state
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    // Set state with history
    set(path, value, recordHistory = true) {
        const oldValue = this.get(path);
        
        if (recordHistory && !this.batchMode) {
            this.recordHistory();
        }
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key], this.state);
        target[lastKey] = value;
        
        if (!this.batchMode) {
            this.notifyListeners(path, value, oldValue);
            this.saveToStorage();
        } else {
            this.batchUpdates.push({ path, value, oldValue });
        }
    }

    // Batch multiple updates
    beginBatch() {
        this.batchMode = true;
        this.batchUpdates = [];
    }

    endBatch() {
        this.batchMode = false;
        this.recordHistory();
        this.batchUpdates.forEach(({ path, value, oldValue }) => {
            this.notifyListeners(path, value, oldValue);
        });
        this.saveToStorage();
        this.batchUpdates = [];
    }

    // Subscribe to changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        return () => {
            this.listeners.get(path)?.delete(callback);
        };
    }

    // Notify listeners
    notifyListeners(path, newValue, oldValue) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                callback(newValue, oldValue);
            });
        }
        
        // Also notify wildcard listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback({ path, newValue, oldValue });
            });
        }
    }

    // History management
    recordHistory() {
        this.state.history.past.push(JSON.stringify(this.state));
        this.state.history.future = [];
        
        // Limit history size
        if (this.state.history.past > 50) {
            this.state.history.past.shift();
        }
    }

    undo() {
        if (this.state.history.past.length === 0) return false;
        
        const previous = JSON.parse(this.state.history.past.pop());
        this.state.history.future.push(JSON.stringify(this.state));
        this.state = previous;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    redo() {
        if (this.state.history.future.length === 0) return false;
        
        const next = JSON.parse(this.state.history.future.pop());
        this.state.history.past.push(JSON.stringify(this.state));
        this.state = next;
        this.notifyListeners('*', null, null);
        this.saveToStorage();
        return true;
    }

    // Storage
    saveToStorage() {
        try {
            localStorage.setItem('portfolio-generator', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('portfolio-generator');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    // Reset
    reset() {
        if (confirm('Reset all changes? This cannot be undone.')) {
            localStorage.removeItem('portfolio-generator');
            window.location.reload();
        }
    }

    // Export/Import
    exportData() {
        return JSON.stringify(this.state, null, 2);
    }

    importData(json) {
        try {
            const data = JSON.parse(json);
            this.state = data;
            this.saveToStorage();
            this.notifyListeners('*', null, null);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}