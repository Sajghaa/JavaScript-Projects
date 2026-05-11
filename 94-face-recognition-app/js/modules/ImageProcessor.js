// ImageProcessor.js - Handles image loading, resizing, and manipulation
class ImageProcessor {
    constructor() {
        this.maxDimension = 800;
        this.quality = 0.9;
    }

    // Load image from file
    async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type. Please upload an image.'));
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

    // Load image from URL
    loadImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }

    // Resize image to fit within max dimensions
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

    // Convert canvas to blob
    canvasToBlob(canvas, type = 'image/png') {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), type, this.quality);
        });
    }

    // Get image data URL from canvas
    canvasToDataURL(canvas, type = 'image/png') {
        return canvas.toDataURL(type, this.quality);
    }

    // Create thumbnail
    createThumbnail(img, size = 150) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Calculate cropping to make square
        const minDimension = Math.min(img.width, img.height);
        const offsetX = (img.width - minDimension) / 2;
        const offsetY = (img.height - minDimension) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, minDimension, minDimension, 0, 0, size, size);
        return canvas;
    }

    // Convert data URL to Blob
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

    // Validate image dimensions
    validateImageDimensions(img, minWidth = 100, minHeight = 100) {
        if (img.width < minWidth || img.height < minHeight) {
            throw new Error(`Image too small. Minimum dimensions: ${minWidth}x${minHeight}px`);
        }
        return true;
    }

    // Get image orientation from EXIF (simplified)
    getImageOrientation(file) {
        return new Promise((resolve) => {
            // Simplified - always returns 1 (normal)
            // In production, you'd want to read EXIF data
            resolve(1);
        });
    }

    // Apply image filters (grayscale, sepia, etc.)
    applyFilter(canvas, filter) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        switch(filter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }
                break;
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;
            case 'brightness':
                const brightness = 30;
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + brightness);
                    data[i + 1] = Math.min(255, data[i + 1] + brightness);
                    data[i + 2] = Math.min(255, data[i + 2] + brightness);
                }
                break;
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // Crop image
    cropImage(canvas, x, y, width, height) {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
        return croppedCanvas;
    }

    // Get file size in readable format
    getReadableFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

window.ImageProcessor = ImageProcessor;