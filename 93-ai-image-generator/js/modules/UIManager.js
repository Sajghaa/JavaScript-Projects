// UIManager.js - Handles UI updates and interactions
class UIManager {
    constructor() {
        this.toast = document.getElementById('toast');
        this.loadingOverlay = null;
        this.initLoadingOverlay();
    }
    
    initLoadingOverlay() {
        // Create loading overlay if not exists
        if (!document.getElementById('loadingOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                backdrop-filter: blur(10px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                flex-direction: column;
                gap: 1rem;
            `;
            overlay.innerHTML = `
                <div class="spinner" style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: white;">AI is creating your image...</p>
            `;
            document.body.appendChild(overlay);
            this.loadingOverlay = overlay;
        } else {
            this.loadingOverlay = document.getElementById('loadingOverlay');
        }
    }
    
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showResult(imageUrl, prompt, style) {
        const resultSection = document.getElementById('resultSection');
        const generatedImage = document.getElementById('generatedImage');
        const usedPrompt = document.getElementById('usedPrompt');
        const imageStyle = document.getElementById('imageStyle');
        
        generatedImage.src = imageUrl;
        usedPrompt.textContent = prompt;
        imageStyle.textContent = style;
        resultSection.style.display = 'block';
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    hideResult() {
        const resultSection = document.getElementById('resultSection');
        resultSection.style.display = 'none';
    }
    
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        setTimeout(() => this.toast.classList.remove('show'), 3000);
    }
    
    showError(message) {
        this.showToast(message, 'error');
    }
    
    renderGallery(galleryManager) {
        const container = document.getElementById('galleryGrid');
        const emptyGallery = document.getElementById('emptyGallery');
        const images = galleryManager.getAll();
        
        if (images.length === 0) {
            container.innerHTML = '';
            emptyGallery.style.display = 'block';
            return;
        }
        
        emptyGallery.style.display = 'none';
        container.innerHTML = images.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="Generated Image">
                <button class="gallery-delete" data-index="${index}">✕</button>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('gallery-delete')) {
                    const index = parseInt(item.dataset.index);
                    const image = images[index];
                    this.showResult(image.url, image.prompt, image.style);
                }
            });
        });
        
        container.querySelectorAll('.gallery-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                galleryManager.remove(index);
                this.renderGallery(galleryManager);
                this.showToast('Image removed from gallery', 'info');
            });
        });
    }
    
    updateApiStatus(connected) {
        const statusEl = document.getElementById('apiStatus');
        if (connected) {
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>API Ready</span>';
            statusEl.style.background = '#10b98120';
        } else {
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>API Offline</span>';
            statusEl.style.background = '#ef444420';
        }
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            const newIcon = themeToggle.querySelector('i');
            newIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
    
    setupSuggestions() {
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const promptInput = document.getElementById('promptInput');
                promptInput.value = chip.textContent.trim();
                promptInput.focus();
            });
        });
    }
}

window.UIManager = UIManager;