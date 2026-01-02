document.addEventListener('DOMContentLoaded', function() {
    
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const sampleImages = document.querySelectorAll('.sample-thumbnails img');
    const mainCanvas = document.getElementById('mainCanvas');
    const canvasContext = mainCanvas.getContext('2d');
    const imageContainer = document.getElementById('imageContainer');
    const placeholder = document.querySelector('.placeholder');
    const cropOverlay = document.getElementById('cropOverlay');
    const cropArea = document.getElementById('cropArea');
    const filterOptions = document.querySelectorAll('.filter-option');
    const filterIntensity = document.getElementById('filter-intensity');
    const intensityValue = document.getElementById('intensity-value');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const flipHorizontalBtn = document.getElementById('flip-horizontal');
    const applyCropBtn = document.getElementById('apply-crop');
    const resetAllBtn = document.getElementById('reset-all');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const formatButtons = document.querySelectorAll('.format-btn');
    const exportQuality = document.getElementById('export-quality');
    const qualityValue = document.getElementById('quality-value');
    const downloadBtn = document.getElementById('download-btn');
    const dimensionsDisplay = document.getElementById('dimensions');
    const currentFilterDisplay = document.getElementById('current-filter');
    const currentRotationDisplay = document.getElementById('current-rotation');
    const statusDisplay = document.getElementById('status');
    
   
    let originalImage = null;
    let currentImage = null;
    let currentFilter = 'none';
    let currentRotation = 0;
    let currentFlip = { horizontal: 1, vertical: 1 };
    let cropRatio = 'free';
    let isCropping = false;
    let cropStartX = 0;
    let cropStartY = 0;
    let cropAreaX = 100;
    let cropAreaY = 100;
    let cropAreaWidth = 300;
    let cropAreaHeight = 300;
    let activeCropHandle = null;
    
  
    const ImageProcessor = {
        // Load image from file or URL
        loadImage: function(src, callback) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                callback(img);
            };
            img.onerror = function() {
                console.error('Failed to load image');
                statusDisplay.textContent = 'Error loading image';
                statusDisplay.style.color = '#e74c3c';
            };
            img.src = src;
        },
        
        // Apply filter to canvas
        applyFilter: function(filter, intensity = 50) {
            if (!currentImage) return;
            
            // Reset filter first
            canvasContext.filter = 'none';
            
    
            switch(filter) {
                case 'vintage':
                    canvasContext.filter = `sepia(${intensity/100}) contrast(1.2) brightness(1.1)`;
                    break;
                case 'grayscale':
                    canvasContext.filter = `grayscale(${intensity/100})`;
                    break;
                case 'sepia':
                    canvasContext.filter = `sepia(${intensity/100})`;
                    break;
                case 'brightness':
                    const brightnessValue = 1 + (intensity/100);
                    canvasContext.filter = `brightness(${brightnessValue})`;
                    break;
                case 'invert':
                    canvasContext.filter = `invert(${intensity/100})`;
                    break;
                case 'blur':
                    const blurValue = (intensity/100) * 5;
                    canvasContext.filter = `blur(${blurValue}px)`;
                    break;
                case 'hue':
                    const hueValue = (intensity/100) * 360;
                    canvasContext.filter = `hue-rotate(${hueValue}deg)`;
                    break;
                case 'none':
                default:
                    canvasContext.filter = 'none';
            }
            
            this.drawImage();
            currentFilter = filter;
            currentFilterDisplay.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
        },
        
       
        drawImage: function() {
            if (!currentImage) return;
            
           
            canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
            
        
            canvasContext.save();
            
            
            canvasContext.translate(mainCanvas.width / 2, mainCanvas.height / 2);
            
            canvasContext.rotate(currentRotation * Math.PI / 180);
            
            canvasContext.scale(currentFlip.horizontal, currentFlip.vertical);
            
            canvasContext.drawImage(
                currentImage, 
                -currentImage.width / 2, 
                -currentImage.height / 2,
                currentImage.width,
                currentImage.height
            );
            
            canvasContext.restore();
        },
        
        rotate: function(degrees) {
            currentRotation += degrees;
         
            currentRotation = (currentRotation % 360 + 360) % 360;
            currentRotationDisplay.textContent = `${currentRotation}°`;
            this.drawImage();
        },
        
        flipHorizontal: function() {
            currentFlip.horizontal *= -1;
            this.drawImage();
        },
        
        crop: function(x, y, width, height) {
            if (!currentImage) return;
            
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = width;
            tempCanvas.height = height;
            
            const sourceX = x;
            const sourceY = y;
            
            tempCtx.drawImage(
                currentImage,
                sourceX, sourceY, width, height,
                0, 0, width, height
            );
            
            const croppedImage = new Image();
            croppedImage.onload = function() {
                currentImage = croppedImage;
                ImageProcessor.updateCanvasSize();
                ImageProcessor.drawImage();
                statusDisplay.textContent = 'Image cropped successfully';
            };
            croppedImage.src = tempCanvas.toDataURL();
            
            // Reset crop state
            isCropping = false;
            cropOverlay.style.display = 'none';
        },
        
        // Update canvas size based on image and container
        updateCanvasSize: function() {
            if (!currentImage) return;
            
            const containerWidth = imageContainer.clientWidth;
            const containerHeight = imageContainer.clientHeight;
            
            // Calculate scale to fit image in container
            const scale = Math.min(
                containerWidth / currentImage.width,
                containerHeight / currentImage.height,
                1
            );
            
            // Set canvas dimensions
            mainCanvas.width = currentImage.width * scale;
            mainCanvas.height = currentImage.height * scale;
            
            // Update dimensions display
            dimensionsDisplay.textContent = `${currentImage.width} x ${currentImage.height}`;
        },
        
        // Reset all edits
        resetAll: function() {
            if (!originalImage) return;
            
            // Create a new image from the original
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                currentFilter = 'none';
                currentRotation = 0;
                currentFlip = { horizontal: 1, vertical: 1 };
                
                // Reset UI
                filterOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.filter === 'none') {
                        option.classList.add('active');
                    }
                });
                
                filterIntensity.value = 50;
                intensityValue.textContent = '50%';
                currentFilterDisplay.textContent = 'None';
                currentRotationDisplay.textContent = '0°';
                statusDisplay.textContent = 'Reset to original';
                
                // Reset canvas and redraw
                canvasContext.filter = 'none';
                ImageProcessor.updateCanvasSize();
                ImageProcessor.drawImage();
            };
            img.src = originalImage.src;
        },
        
        // Export image with specified format and quality
        exportImage: function(format, quality) {
            if (!currentImage) {
                alert('Please upload an image first');
                return;
            }
            
            // Create a temporary canvas for export
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = currentImage.width;
            exportCanvas.height = currentImage.height;
            const exportCtx = exportCanvas.getContext('2d');
            
            // Apply current filter to export
            exportCtx.filter = canvasContext.filter;
            
            // Draw image to export canvas
            exportCtx.drawImage(currentImage, 0, 0);
            
            // Convert to data URL
            let dataUrl;
            if (format === 'jpeg') {
                dataUrl = exportCanvas.toDataURL('image/jpeg', quality / 100);
            } else if (format === 'webp') {
                dataUrl = exportCanvas.toDataURL('image/webp', quality / 100);
            } else {
                dataUrl = exportCanvas.toDataURL('image/png');
            }
            
            // Create download link
            const link = document.createElement('a');
            link.download = `photo-editor-lite-export.${format}`;
            link.href = dataUrl;
            link.click();
            
            statusDisplay.textContent = 'Image exported successfully';
        }
    };
    
    // Crop Module
    const CropModule = {
        // Initialize crop overlay
        init: function() {
            this.setupEventListeners();
        },
        
        // Setup event listeners for crop interaction
        setupEventListeners: function() {
            // Crop area drag
            cropArea.addEventListener('mousedown', this.startCropDrag.bind(this));
            document.addEventListener('mousemove', this.dragCrop.bind(this));
            document.addEventListener('mouseup', this.stopCropDrag.bind(this));
            
            // Crop handles
            const handles = cropArea.querySelectorAll('.crop-handle');
            handles.forEach(handle => {
                handle.addEventListener('mousedown', function(e) {
                    e.stopPropagation();
                    activeCropHandle = this.classList[1];
                    cropStartX = e.clientX;
                    cropStartY = e.clientY;
                });
            });
        },
        
        // Start dragging crop area
        startCropDrag: function(e) {
            isCropping = true;
            const rect = cropArea.getBoundingClientRect();
            cropStartX = e.clientX - rect.left;
            cropStartY = e.clientY - rect.top;
        },
        
        // Drag crop area
        dragCrop: function(e) {
            if (!isCropping && !activeCropHandle) return;
            
            const containerRect = imageContainer.getBoundingClientRect();
            const x = e.clientX - containerRect.left;
            const y = e.clientY - containerRect.top;
            
            if (activeCropHandle) {
                // Resize crop area based on handle
                this.resizeCropArea(x, y);
            } else {
                // Move crop area
                this.moveCropArea(x, y);
            }
            
            this.updateCropArea();
        },
        
        // Stop dragging crop area
        stopCropDrag: function() {
            isCropping = false;
            activeCropHandle = null;
        },
        
        // Move crop area
        moveCropArea: function(x, y) {
            cropAreaX = Math.max(0, Math.min(x - cropStartX, imageContainer.clientWidth - cropAreaWidth));
            cropAreaY = Math.max(0, Math.min(y - cropStartY, imageContainer.clientHeight - cropAreaHeight));
        },
        
        // Resize crop area based on handle
        resizeCropArea: function(x, y) {
            const containerWidth = imageContainer.clientWidth;
            const containerHeight = imageContainer.clientHeight;
            
            switch(activeCropHandle) {
                case 'top-left':
                    cropAreaWidth += cropAreaX - x;
                    cropAreaHeight += cropAreaY - y;
                    cropAreaX = Math.max(0, x);
                    cropAreaY = Math.max(0, y);
                    break;
                case 'top-right':
                    cropAreaWidth = Math.max(50, x - cropAreaX);
                    cropAreaHeight += cropAreaY - y;
                    cropAreaY = Math.max(0, y);
                    break;
                case 'bottom-left':
                    cropAreaWidth += cropAreaX - x;
                    cropAreaHeight = Math.max(50, y - cropAreaY);
                    cropAreaX = Math.max(0, x);
                    break;
                case 'bottom-right':
                    cropAreaWidth = Math.max(50, x - cropAreaX);
                    cropAreaHeight = Math.max(50, y - cropAreaY);
                    break;
                case 'top-center':
                    cropAreaHeight += cropAreaY - y;
                    cropAreaY = Math.max(0, y);
                    break;
                case 'bottom-center':
                    cropAreaHeight = Math.max(50, y - cropAreaY);
                    break;
                case 'left-center':
                    cropAreaWidth += cropAreaX - x;
                    cropAreaX = Math.max(0, x);
                    break;
                case 'right-center':
                    cropAreaWidth = Math.max(50, x - cropAreaX);
                    break;
            }
            
            // Apply aspect ratio if not free
            if (cropRatio !== 'free') {
                const [ratioW, ratioH] = cropRatio.split(':').map(Number);
                const targetRatio = ratioW / ratioH;
                
                if (activeCropHandle && activeCropHandle.includes('right') || 
                    activeCropHandle && activeCropHandle.includes('left')) {
                    // Adjust height based on width
                    cropAreaHeight = cropAreaWidth / targetRatio;
                } else {
                    // Adjust width based on height
                    cropAreaWidth = cropAreaHeight * targetRatio;
                }
            }
            
            // Ensure crop area stays within container bounds
            cropAreaWidth = Math.min(cropAreaWidth, containerWidth - cropAreaX);
            cropAreaHeight = Math.min(cropAreaHeight, containerHeight - cropAreaY);
        },
        
        // Update crop area position and size
        updateCropArea: function() {
            cropArea.style.left = `${cropAreaX}px`;
            cropArea.style.top = `${cropAreaY}px`;
            cropArea.style.width = `${cropAreaWidth}px`;
            cropArea.style.height = `${cropAreaHeight}px`;
        },
        
        // Start cropping
        startCropping: function() {
            if (!currentImage) {
                alert('Please upload an image first');
                return;
            }
            
            // Show crop overlay
            cropOverlay.style.display = 'block';
            
            // Initialize crop area size and position
            const containerWidth = imageContainer.clientWidth;
            const containerHeight = imageContainer.clientHeight;
            
            // Set crop area to center with reasonable size
            cropAreaWidth = Math.min(containerWidth * 0.7, 400);
            cropAreaHeight = Math.min(containerHeight * 0.7, 300);
            
            if (cropRatio !== 'free') {
                const [ratioW, ratioH] = cropRatio.split(':').map(Number);
                const targetRatio = ratioW / ratioH;
                
                if (cropAreaWidth / cropAreaHeight > targetRatio) {
                    cropAreaWidth = cropAreaHeight * targetRatio;
                } else {
                    cropAreaHeight = cropAreaWidth / targetRatio;
                }
            }
            
            cropAreaX = (containerWidth - cropAreaWidth) / 2;
            cropAreaY = (containerHeight - cropAreaHeight) / 2;
            
            this.updateCropArea();
            statusDisplay.textContent = 'Cropping mode - drag handles to adjust';
        },
        
        // Apply crop to image
        applyCrop: function() {
            if (!currentImage) return;
            
            // Calculate crop coordinates in image pixels
            const scaleX = currentImage.width / mainCanvas.width;
            const scaleY = currentImage.height / mainCanvas.height;
            
            const cropX = (cropAreaX + (cropAreaWidth / 2) - (mainCanvas.width / 2)) * scaleX;
            const cropY = (cropAreaY + (cropAreaHeight / 2) - (mainCanvas.height / 2)) * scaleY;
            const cropWidth = cropAreaWidth * scaleX;
            const cropHeight = cropAreaHeight * scaleY;
            
            // Ensure crop coordinates are within image bounds
            const boundedX = Math.max(0, Math.min(cropX, currentImage.width));
            const boundedY = Math.max(0, Math.min(cropY, currentImage.height));
            const boundedWidth = Math.min(cropWidth, currentImage.width - boundedX);
            const boundedHeight = Math.min(cropHeight, currentImage.height - boundedY);
            
            // Apply crop
            ImageProcessor.crop(boundedX, boundedY, boundedWidth, boundedHeight);
        }
    };
    
    // Initialize the application
    function initApp() {
        // Setup event listeners for UI elements
        setupEventListeners();
        
        // Initialize crop module
        CropModule.init();
        
        // Set initial status
        statusDisplay.textContent = 'Ready to edit photos';
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Upload image via file input
        imageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    ImageProcessor.loadImage(event.target.result, function(img) {
                        setupImage(img);
                    });
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Upload area click triggers file input
        uploadArea.addEventListener('click', function() {
            imageInput.click();
        });
        
        // Drag and drop for upload area
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#e6eeff';
            uploadArea.style.borderColor = '#2575fc';
        });
        
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.style.backgroundColor = '#f9f7ff';
            uploadArea.style.borderColor = '#6a11cb';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f9f7ff';
            uploadArea.style.borderColor = '#6a11cb';
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        ImageProcessor.loadImage(event.target.result, function(img) {
                            setupImage(img);
                        });
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    alert('Please drop an image file');
                }
            }
        });
        
        // Sample images
        sampleImages.forEach(img => {
            img.addEventListener('click', function() {
                const sampleNum = this.dataset.sample;
                let sampleUrl;
                
                // Use different sample images based on the dataset
                switch(sampleNum) {
                    case '1':
                        sampleUrl = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        break;
                    case '2':
                        sampleUrl = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        break;
                    case '3':
                        sampleUrl = 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        break;
                }
                
                ImageProcessor.loadImage(sampleUrl, function(img) {
                    setupImage(img);
                });
            });
        });
        
        // Filter selection
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update active filter UI
                filterOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Apply selected filter
                const filter = this.dataset.filter;
                const intensity = parseInt(filterIntensity.value);
                ImageProcessor.applyFilter(filter, intensity);
                statusDisplay.textContent = `Applied ${filter} filter`;
            });
        });
        
        // Filter intensity slider
        filterIntensity.addEventListener('input', function() {
            intensityValue.textContent = `${this.value}%`;
            ImageProcessor.applyFilter(currentFilter, parseInt(this.value));
        });
        
        // Rotate buttons
        rotateLeftBtn.addEventListener('click', function() {
            ImageProcessor.rotate(-90);
            statusDisplay.textContent = 'Rotated -90°';
        });
        
        rotateRightBtn.addEventListener('click', function() {
            ImageProcessor.rotate(90);
            statusDisplay.textContent = 'Rotated +90°';
        });
        
        flipHorizontalBtn.addEventListener('click', function() {
            ImageProcessor.flipHorizontal();
            statusDisplay.textContent = 'Flipped horizontally';
        });
        
        // Crop preset buttons
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active preset UI
                presetButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Set crop ratio
                cropRatio = this.dataset.ratio;
                
                // If already in crop mode, update crop area
                if (cropOverlay.style.display === 'block') {
                    CropModule.startCropping();
                }
                
                statusDisplay.textContent = `Crop ratio set to ${cropRatio}`;
            });
        });
        
        // Apply crop button
        applyCropBtn.addEventListener('click', function() {
            if (cropOverlay.style.display === 'block') {
                CropModule.applyCrop();
            } else {
                CropModule.startCropping();
            }
        });
        
        // Reset all button
        resetAllBtn.addEventListener('click', function() {
            ImageProcessor.resetAll();
        });
        
        // Export format buttons
        formatButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                formatButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Export quality slider
        exportQuality.addEventListener('input', function() {
            qualityValue.textContent = `${this.value}%`;
        });
        
        // Download button
        downloadBtn.addEventListener('click', function() {
            const format = document.querySelector('.format-btn.active').dataset.format;
            const quality = parseInt(exportQuality.value);
            ImageProcessor.exportImage(format, quality);
        });
    }
    
    // Setup image for editing
    function setupImage(img) {
        // Store original image
        originalImage = img;
        currentImage = img;
        
     
        placeholder.style.display = 'none';
        mainCanvas.style.display = 'block';
        
 
        currentFilter = 'none';
        currentRotation = 0;
        currentFlip = { horizontal: 1, vertical: 1 };
        

        filterOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.filter === 'none') {
                option.classList.add('active');
            }
        });
        
        filterIntensity.value = 50;
        intensityValue.textContent = '50%';
        currentFilterDisplay.textContent = 'None';
        currentRotationDisplay.textContent = '0°';
        statusDisplay.textContent = 'Image loaded successfully';
        statusDisplay.style.color = '#27ae60';
        
        ImageProcessor.updateCanvasSize();
        ImageProcessor.drawImage();
    }
    
    
    initApp();
});