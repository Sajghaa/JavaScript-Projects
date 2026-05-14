// GalleryManager.js - Manages saved images gallery
class GalleryManager {
    constructor() {
        this.images = [];
        this.listeners = [];
        this.load();
    }
    
    load() {
        const saved = localStorage.getItem('ai_image_gallery');
        if (saved) {
            try {
                this.images = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load gallery', e);
                this.images = [];
            }
        }
    }
    
    save() {
        localStorage.setItem('ai_image_gallery', JSON.stringify(this.images));
        this.notifyListeners();
    }
    
    add(imageData) {
        this.images.unshift(imageData);
        this.save();
        return imageData;
    }
    
    remove(index) {
        if (index >= 0 && index < this.images.length) {
            this.images.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
    
    clear() {
        this.images = [];
        this.save();
    }
    
    getAll() {
        return [...this.images];
    }
    
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) this.listeners.splice(index, 1);
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.images));
    }
}

window.GalleryManager = GalleryManager;