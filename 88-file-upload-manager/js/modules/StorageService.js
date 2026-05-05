class StorageService {
    constructor() {
        this.dbName = 'FileManagerDB';
        this.storeName = 'files';
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => { this.db = request.result; resolve(this.db); };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if(!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    async saveFile(id, data) { await this.initDB(); return new Promise((resolve, reject) => { const tx = this.db.transaction([this.storeName], 'readwrite'); const store = tx.objectStore(this.storeName); const request = store.put({ id, data }); request.onsuccess = () => resolve(true); request.onerror = () => reject(request.error); }); }
    async getFile(id) { await this.initDB(); return new Promise((resolve, reject) => { const tx = this.db.transaction([this.storeName], 'readonly'); const store = tx.objectStore(this.storeName); const request = store.get(id); request.onsuccess = () => resolve(request.result?.data); request.onerror = () => reject(request.error); }); }
    async deleteFile(id) { await this.initDB(); return new Promise((resolve, reject) => { const tx = this.db.transaction([this.storeName], 'readwrite'); const store = tx.objectStore(this.storeName); const request = store.delete(id); request.onsuccess = () => resolve(true); request.onerror = () => reject(request.error); }); }
}
window.StorageService = StorageService;