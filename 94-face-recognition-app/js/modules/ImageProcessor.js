// ImageProcessor.js - Image handling utilities
class ImageProcessor {
    constructor(maxDimension = 800) {
        this.maxDimension = maxDimension;
    }

    loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const img = await this.loadImageFromUrl(e.target.result);
                    resolve(img);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    loadImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = url;
        });
    }

    resizeImage(img, maxWidth = null, maxHeight = null) {
        const width = maxWidth || this.maxDimension;
        const height = maxHeight || this.maxDimension;
        
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (newWidth > width) {
            newHeight = (newHeight * width) / newWidth;
            newWidth = width;
        }
        
        if (newHeight > height) {
            newWidth = (newWidth * height) / newHeight;
            newHeight = height;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        return canvas;
    }

    canvasToDataURL(canvas, type = 'image/png') {
        return canvas.toDataURL(type);
    }

    dataURLToBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    }

    getReadableFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

window.ImageProcessor = ImageProcessor;