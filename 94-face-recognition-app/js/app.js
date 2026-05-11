// Main application with modular structure
const uiManager = new UIManager();
const imageProcessor = new ImageProcessor();

let faceDetectionModel = null;
let isModelsLoaded = false;
let currentImageData = null;
let currentDetections = null;
let video = null;
let stream = null;

// Sample images (using placeholder images from Unsplash)
const sampleImages = {
    sample1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    sample2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    sample3: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800'
};

// Initialize face-api
async function loadModels() {
    try {
        uiManager.updateModelStatus('loading', '<i class="fas fa-spinner fa-pulse"></i> Loading Models...');
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models/';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        
        isModelsLoaded = true;
        
        uiManager.updateModelStatus('success', '<i class="fas fa-check-circle"></i> Models Ready');
        uiManager.showSuccess('AI Models loaded successfully!');
    } catch (error) {
        console.error('Error loading models:', error);
        uiManager.updateModelStatus('error', '<i class="fas fa-exclamation-circle"></i> Model Error');
        uiManager.showError('Failed to load AI models. Please refresh the page.');
    }
}

// Detect faces in image
async function detectFaces(imageElement) {
    if (!isModelsLoaded) {
        uiManager.showError('Models still loading, please wait...');
        return null;
    }
    
    uiManager.showLoading('Analyzing image...');
    
    try {
        const detections = await faceapi.detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        
        currentDetections = detections;
        displayResults(detections, imageElement);
        return detections;
    } catch (error) {
        console.error('Detection error:', error);
        uiManager.showError('Error detecting faces. Please try another image.');
        return null;
    } finally {
        uiManager.hideLoading();
    }
}

// Display results on canvas
function displayResults(detections, imageElement) {
    // Set canvas dimensions
    uiManager.setCanvasDimensions(imageElement.width, imageElement.height);
    
    // Draw original image
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);
    
    // Draw detections on overlay
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    faceapi.draw.drawDetections(overlayCanvas, detections);
    faceapi.draw.drawFaceLandmarks(overlayCanvas, detections);
    
    // Draw expressions and info
    detections.forEach(detection => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const age = Math.round(detection.age);
        const gender = detection.gender;
        
        // Find top emotion
        let topEmotion = '';
        let topValue = 0;
        for (const [emotion, value] of Object.entries(expressions)) {
            if (value > topValue) {
                topValue = value;
                topEmotion = emotion;
            }
        }
        
        // Draw emotion label
        overlayCtx.font = '14px Inter';
        overlayCtx.fillStyle = '#6366f1';
        overlayCtx.shadowBlur = 0;
        overlayCtx.fillText(
            `${topEmotion} (${Math.round(topValue * 100)}%) | ${gender} | ${age}y`,
            box.x,
            box.y - 10
        );
    });
    
    // Update UI
    uiManager.updateFaceCount(detections.length);
    uiManager.renderFacesList(detections);
    uiManager.renderEmotionSummary(detections);
    uiManager.showResults();
    
    // Update download link
    const combinedCanvas = captureCanvas();
    if (combinedCanvas) {
        uiManager.updateDownloadLink(combinedCanvas.toDataURL());
    }
}

// Capture combined canvas for download
function captureCanvas() {
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = displayCanvas.width;
    combinedCanvas.height = displayCanvas.height;
    const ctx = combinedCanvas.getContext('2d');
    ctx.drawImage(displayCanvas, 0, 0);
    ctx.drawImage(overlayCanvas, 0, 0);
    return combinedCanvas;
}

// Process uploaded image
async function processImage(file) {
    if (!file) return;
    
    try {
        const img = await imageProcessor.loadImageFromFile(file);
        await detectFaces(img);
    } catch (error) {
        uiManager.showError(error.message);
    }
}

// Process sample image
async function processSampleImage(url) {
    try {
        const img = await imageProcessor.loadImageFromUrl(url);
        await detectFaces(img);
    } catch (error) {
        uiManager.showError('Failed to load sample image: ' + error.message);
    }
}

// Setup camera
async function setupCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video = document.getElementById('video');
        video.srcObject = stream;
        await video.play();
        uiManager.showCameraModal();
    } catch (error) {
        uiManager.showError('Camera access denied or not available');
    }
}

// Capture photo from camera
function capturePhoto() {
    if (!video) return;
    
    const canvas = document.getElementById('photoCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        await processImage(file);
        closeCamera();
    }, 'image/jpeg');
}

// Close camera
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    uiManager.hideCameraModal();
}

// Reset view
function resetView() {
    if (currentDetections) {
        const overlayCtx = overlayCanvas.getContext('2d');
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        faceapi.draw.drawDetections(overlayCanvas, currentDetections);
        faceapi.draw.drawFaceLandmarks(overlayCanvas, currentDetections);
    }
}

// Event Listeners
document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('imageUpload').click();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    if (e.target.files[0]) processImage(e.target.files[0]);
});

document.getElementById('cameraBtn').addEventListener('click', setupCamera);
document.getElementById('captureBtn').addEventListener('click', capturePhoto);
document.getElementById('closeCameraBtn').addEventListener('click', closeCamera);
document.getElementById('resetZoomBtn').addEventListener('click', resetView);
document.getElementById('themeToggle').addEventListener('click', () => uiManager.toggleTheme());

// Sample buttons
document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sample = btn.dataset.sample;
        if (sampleImages[sample]) {
            processSampleImage(sampleImages[sample]);
        }
    });
});

// Close modal on outside click
window.onclick = (e) => {
    if (e.target === document.getElementById('cameraModal')) closeCamera();
};
window.closeModal = () => closeCamera();

// Initialize
uiManager.loadTheme();
loadModels();

console.log('Face Recognition App Ready!');