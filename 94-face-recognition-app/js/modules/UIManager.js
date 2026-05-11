// UIManager.js - UI management utilities
class UIManager {
    constructor() {
        this.toast = document.getElementById('toast');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.resultsSection = document.getElementById('resultsSection');
        this.modelStatus = document.getElementById('modelStatus');
    }

    showLoading(message = 'Processing...') {
        if (this.loadingOverlay) {
            const textEl = this.loadingOverlay.querySelector('p');
            if (textEl) textEl.textContent = message;
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    showResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'grid';
        }
    }

    hideResults() {
        if (this.resultsSection) {
            this.resultsSection.style.display = 'none';
        }
    }

    updateModelStatus(status, message) {
        if (this.modelStatus) {
            this.modelStatus.innerHTML = message;
            this.modelStatus.className = `status-badge ${status}`;
        }
    }

    showToast(message, type = 'success') {
        if (!this.toast) return;
        
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    clearCanvases(displayCanvas, overlayCanvas) {
        if (displayCanvas) {
            const ctx = displayCanvas.getContext('2d');
            ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        }
        if (overlayCanvas) {
            const ctx = overlayCanvas.getContext('2d');
            ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
    }

    setCanvasDimensions(displayCanvas, overlayCanvas, width, height) {
        if (displayCanvas) {
            displayCanvas.width = width;
            displayCanvas.height = height;
        }
        if (overlayCanvas) {
            overlayCanvas.width = width;
            overlayCanvas.height = height;
        }
    }

    renderFacesList(container, detections) {
        if (!container) return;
        
        if (!detections || detections.length === 0) {
            container.innerHTML = '<div class="empty-state">No faces detected</div>';
            return;
        }
        
        container.innerHTML = detections.map((detection, index) => {
            const expressions = detection.expressions;
            const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
            const age = Math.round(detection.age);
            const gender = detection.gender;
            
            return `
                <div class="face-card">
                    <div class="face-header">
                        <strong>Face #${index + 1}</strong>
                        <span>${gender} | ${age} years</span>
                    </div>
                    <div class="emotions">
                        ${sorted.map(([emotion, value]) => `
                            <span class="emotion-badge" style="background: ${EmotionAnalyzer.getEmotionColor(emotion)}20; color: ${EmotionAnalyzer.getEmotionColor(emotion)}">
                                ${EmotionAnalyzer.getEmotionIcon(emotion)} ${emotion} ${Math.round(value * 100)}%
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderEmotionSummary(container, detections) {
        if (!container) return;
        
        if (!detections || detections.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const aggregated = EmotionAnalyzer.aggregateEmotions(detections);
        const sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]);
        
        container.innerHTML = `
            <h4>Overall Emotion Distribution</h4>
            <div class="summary-chart">
                ${sorted.map(([emotion, percent]) => `
                    <div class="summary-bar">
                        <span class="summary-label">${EmotionAnalyzer.getEmotionIcon(emotion)} ${emotion}</span>
                        <div class="summary-bar-fill">
                            <div class="summary-fill" style="width: ${percent}%; background: ${EmotionAnalyzer.getEmotionColor(emotion)}"></div>
                        </div>
                        <span class="summary-percent">${Math.round(percent)}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        return newTheme;
    }

    loadTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        return saved;
    }
}

window.UIManager = UIManager;