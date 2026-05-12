class GalleryManager {
    constructor() {
        this.images = [];
        this.loadGallery();
    }

    loadGallery() {
        const saved = localStorage.getItem('ai_gallery');
        if (saved) {
            this.images = JSON.parse(saved);
        }
    }

    saveGallery() {
        localStorage.setItem('ai_gallery', JSON.stringify(this.images));
        this.trigger('galleryUpdated', this.images);
    }

    addImage(imageData) {
        this.images.unshift(imageData);
        this.saveGallery();
        return imageData;
    }

    removeImage(index) {
        this.images.splice(index, 1);
        this.saveGallery();
    }

    clearGallery() {
        this.images = [];
        this.saveGallery();
    }

    getImages() {
        return this.images;
    }

    on(event, callback) {
        if (!this._callbacks) this._callbacks = {};
        if (!this._callbacks[event]) this._callbacks[event] = [];
        this._callbacks[event].push(callback);
    }

    trigger(event, data) {
        if (this._callbacks && this._callbacks[event]) {
            this._callbacks[event].forEach(cb => cb(data));
        }
    }
}

window.GalleryManager = GalleryManager;