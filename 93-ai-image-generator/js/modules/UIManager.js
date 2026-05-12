class UIManager {
    constructor() {
        this.toast = document.getElementById('toast');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.resultSection = document.getElementById('resultSection');
        this.generatedImage = document.getElementById('generatedImage');
        this.usedPrompt = document.getElementById('usedPrompt');
        this.imageModel = document.getElementById('imageModel');
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.animateProgressSteps();
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    animateProgressSteps() {
        const steps = document.querySelectorAll('.progress-steps .step');
        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                steps.forEach(s => s.classList.remove('active'));
                steps[i].classList.add('active');
                i++;
            } else {
                clearInterval(interval);
            }
        }, 1500);
    }

    showResult(imageUrl, prompt, model) {
        this.generatedImage.src = imageUrl;
        this.usedPrompt.textContent = prompt;
        this.imageModel.textContent = model.split('/').pop();
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideResult() {
        this.resultSection.style.display = 'none';
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        setTimeout(() => this.toast.classList.remove('show'), 3000);
    }

    renderGallery(galleryManager) {
        const container = document.getElementById('galleryGrid');
        const emptyGallery = document.getElementById('emptyGallery');
        const images = galleryManager.getImages();
        
        if (images.length === 0) {
            container.innerHTML = '';
            emptyGallery.style.display = 'block';
            return;
        }
        
        emptyGallery.style.display = 'none';
        
        container.innerHTML = images.map((image, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${image.url}" alt="Generated Image">
                <div class="gallery-item-actions">
                    <button class="gallery-item-delete" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.gallery-item-delete')) {
                    const index = parseInt(item.dataset.index);
                    const image = images[index];
                    this.showResult(image.url, image.prompt, image.model);
                }
            });
        });
        
        container.querySelectorAll('.gallery-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                galleryManager.removeImage(index);
                this.renderGallery(galleryManager);
                this.showToast('Image removed from gallery', 'info');
            });
        });
    }

    updateApiStatus(hasKey) {
        const statusEl = document.getElementById('apiStatus');
        if (hasKey) {
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>API Ready</span>';
            statusEl.style.background = '#10b98120';
        } else {
            statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>API Key Required</span>';
            statusEl.style.background = '#ef444420';
        }
    }

    promptSuggestions() {
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const textarea = document.getElementById('promptInput');
                textarea.value = chip.textContent;
                textarea.focus();
            });
        });
    }

    setupApiKeyModal() {
        const savedKey = localStorage.getItem('hf_api_key');
        if (!savedKey) {
            setTimeout(() => {
                const key = prompt('Enter your Hugging Face API Key:\n\nGet one from: https://huggingface.co/settings/tokens');
                if (key) {
                    const apiManager = window.app?.apiManager;
                    if (apiManager) {
                        apiManager.setApiKey(key);
                        this.updateApiStatus(true);
                        this.showToast('API Key saved successfully!', 'success');
                    }
                }
            }, 500);
        }
    }
}

window.UIManager = UIManager;