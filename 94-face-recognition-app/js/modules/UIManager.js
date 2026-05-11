// UIManager.js - Manages UI updates and interactions
class UIManager {
    constructor() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.resultsSection = document.getElementById('resultsSection');
        this.faceCountSpan = document.getElementById('faceCount');
        this.facesList = document.getElementById('facesList');
        this.emotionSummary = document.getElementById('emotionSummary');
        this.displayCanvas = document.getElementById('displayCanvas');
        this.overlayCanvas = document.getElementById('overlayCanvas');
        this.toast = document.getElementById('toast');
        this.modelStatus = document.getElementById('modelStatus');
    }

    // Show loading overlay with custom message
    showLoading(message = 'Processing image...') {
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('.loading-content p');
            if (loadingText) loadingText.textContent = message;
            this.loadingOverlay.style.display = 'flex';
        }
    }

    // Hide loading overlay
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    // Show results section
    showResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'grid';
        }
    }

    // Hide results section
    hideResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
    }

    // Update model status in header
    updateModelStatus(status, message) {
        if (this.modelStatus) {
            this.modelStatus.innerHTML = message;
            this.modelStatus.className = `status-badge ${status}`;
        }
    }

    // Update face count display
    updateFaceCount(count) {
        if (this.faceCountSpan) {
            this.faceCountSpan.textContent = `${count} face${count !== 1 ? 's' : ''} detected`;
        }
    }

    // Render faces list in sidebar
    renderFacesList(detections) {
        if (!this.facesList) return;
        
        if (detections.length === 0) {
            this.facesList.innerHTML = '<div class="empty-state">No faces detected in this image</div>';
            return;
        }
        
        this.facesList.innerHTML = detections.map((detection, index) => {
            const expressions = detection.expressions;
            const sortedExpressions = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
            const age = Math.round(detection.age);
            const gender = detection.gender;
            
            return `
                <div class="face-card" data-face-index="${index}">
                    <div class="face-header">
                        <span class="face-number">Face #${index + 1}</span>
                        <span class="face-bounding-box">${gender} | ${age} years</span>
                    </div>
                    <div class="emotions">
                        ${sortedExpressions.map(([emotion, value]) => `
                            <span class="emotion-badge emotion-${emotion}" title="${Math.round(value * 100)}% confidence">
                                ${this.getEmotionIcon(emotion)} ${emotion} ${Math.round(value * 100)}%
                            </span>
                        `).join('')}
                    </div>
                    <div class="landmarks-info">
                        <i class="fas fa-chart-line"></i> ${detection.landmarks.positions.length} facial landmarks detected
                    </div>
                    <div class="face-confidence">
                        <i class="fas fa-check-circle"></i> Detection confidence: ${Math.round(detection.detection.score * 100)}%
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click handlers to face cards for highlighting
        this.attachFaceCardEvents();
    }

    // Attach click events to face cards for highlighting on canvas
    attachFaceCardEvents() {
        const faceCards = document.querySelectorAll('.face-card');
        faceCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.highlightFaceOnCanvas(index);
                faceCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }

    // Highlight specific face on canvas
    highlightFaceOnCanvas(faceIndex) {
        // This would highlight the corresponding face on the canvas
        // Implementation would need access to detections and canvas
        console.log(`Highlight face ${faceIndex}`);
        // You can implement drawing a thicker border around the selected face
    }

    // Render emotion summary chart
    renderEmotionSummary(detections) {
        if (!this.emotionSummary) return;
        
        if (detections.length === 0) {
            this.emotionSummary.innerHTML = '';
            return;
        }
        
        // Aggregate emotions across all faces
        const aggregated = {
            happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0, neutral: 0
        };
        
        detections.forEach(detection => {
            for (const [emotion, value] of Object.entries(detection.expressions)) {
                aggregated[emotion] += value;
            }
        });
        
        // Average
        for (const emotion in aggregated) {
            aggregated[emotion] = (aggregated[emotion] / detections.length) * 100;
        }
        
        const sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]);
        
        this.emotionSummary.innerHTML = `
            <h4><i class="fas fa-chart-simple"></i> Overall Emotion Distribution</h4>
            <div class="summary-chart">
                ${sorted.map(([emotion, percent]) => `
                    <div class="summary-bar" data-emotion="${emotion}">
                        <span class="summary-label">${this.getEmotionIcon(emotion)} ${emotion}</span>
                        <div class="summary-bar-fill">
                            <div class="summary-fill" style="width: ${percent}%"></div>
                        </div>
                        <span class="summary-percent">${Math.round(percent)}%</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-note">
                <small><i class="fas fa-info-circle"></i> Based on analysis of ${detections.length} face${detections.length !== 1 ? 's' : ''}</small>
            </div>
        `;
    }

    // Show toast notification
    showToast(message, type = 'success') {
        if (!this.toast) return;
        
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // Show error message
    showError(message) {
        this.showToast(message, 'error');
    }

    // Show success message
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    // Show info message
    showInfo(message) {
        this.showToast(message, 'info');
    }

    // Clear canvases
    clearCanvases() {
        if (this.displayCanvas) {
            const ctx = this.displayCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
        }
        if (this.overlayCanvas) {
            const ctx = this.overlayCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }
    }

    // Set canvas dimensions
    setCanvasDimensions(width, height) {
        if (this.displayCanvas) {
            this.displayCanvas.width = width;
            this.displayCanvas.height = height;
        }
        if (this.overlayCanvas) {
            this.overlayCanvas.width = width;
            this.overlayCanvas.height = height;
        }
    }

    // Get emotion icon
    getEmotionIcon(emotion) {
        const icons = {
            happy: '😊', sad: '😢', angry: '😠', surprised: '😲', 
            fearful: '😨', disgusted: '🤢', neutral: '😐'
        };
        return icons[emotion] || '😐';
    }

    // Update download link
    updateDownloadLink(dataURL) {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn && dataURL) {
            downloadBtn.href = dataURL;
        }
    }

    // Reset UI state
    resetUI() {
        this.hideResults();
        this.clearCanvases();
        this.updateFaceCount(0);
        if (this.facesList) this.facesList.innerHTML = '';
        if (this.emotionSummary) this.emotionSummary.innerHTML = '';
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        return newTheme;
    }

    // Load saved theme
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        return savedTheme;
    }

    // Show camera modal
    showCameraModal() {
        const modal = document.getElementById('cameraModal');
        if (modal) modal.classList.add('active');
    }

    // Hide camera modal
    hideCameraModal() {
        const modal = document.getElementById('cameraModal');
        if (modal) modal.classList.remove('active');
    }

    // Update progress for model loading
    updateModelProgress(current, total) {
        const percent = Math.round((current / total) * 100);
        if (this.modelStatus) {
            this.modelStatus.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> Loading models... ${percent}%`;
        }
    }
}

window.UIManager = UIManager;