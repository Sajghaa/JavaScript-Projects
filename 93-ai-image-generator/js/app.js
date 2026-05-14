// app.js - Main application entry point
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize modules
    const apiManager = new APIManager();
    const imageGenerator = new ImageGenerator(apiManager);
    const galleryManager = new GalleryManager();
    const uiManager = new UIManager();
    
    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBtn = document.getElementById('saveBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const promptInput = document.getElementById('promptInput');
    const styleSelect = document.getElementById('styleSelect');
    const sizeSelect = document.getElementById('sizeSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    
    let currentImageData = null;
    
    // Test API connection
    const isConnected = await apiManager.testConnection();
    uiManager.updateApiStatus(isConnected);
    if (!isConnected) {
        uiManager.showToast('API connection issue, but generator will still work', 'warning');
    }
    
    // Generate image
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            uiManager.showToast('Please enter a prompt', 'error');
            return;
        }
        
        const style = styleSelect.value;
        const quality = qualitySelect.value;
        const size = sizeSelect.value;
        
        uiManager.showLoading();
        
        try {
            const result = await imageGenerator.generate(prompt, style, quality, size);
            currentImageData = result;
            uiManager.showResult(result.url, result.prompt, style);
            uiManager.showToast('Image generated successfully!', 'success');
        } catch (error) {
            console.error('Generation error:', error);
            uiManager.showError('Failed to generate image. Please try again.');
        } finally {
            uiManager.hideLoading();
        }
    });
    
    // Download image
    downloadBtn.addEventListener('click', () => {
        if (currentImageData) {
            const link = document.createElement('a');
            link.download = `ai-image-${Date.now()}.png`;
            link.href = currentImageData.url;
            link.click();
            uiManager.showToast('Image downloaded!', 'success');
        }
    });
    
    // Save to gallery
    saveBtn.addEventListener('click', () => {
        if (currentImageData) {
            galleryManager.add(currentImageData);
            uiManager.renderGallery(galleryManager);
            uiManager.showToast('Saved to gallery!', 'success');
        }
    });
    
    // Regenerate
    regenerateBtn.addEventListener('click', () => {
        generateBtn.click();
    });
    
    // Clear gallery
    clearGalleryBtn.addEventListener('click', () => {
        if (confirm('Delete all images from gallery?')) {
            galleryManager.clear();
            uiManager.renderGallery(galleryManager);
            uiManager.showToast('Gallery cleared', 'info');
        }
    });
    
    // Gallery update listener
    galleryManager.addListener(() => {
        uiManager.renderGallery(galleryManager);
    });
    
    // Setup UI
    uiManager.setupThemeToggle();
    uiManager.setupSuggestions();
    uiManager.renderGallery(galleryManager);
    
    // Keyboard shortcut: Ctrl+Enter to generate
    promptInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateBtn.click();
        }
    });
    
    console.log('AI Image Generator Ready!');
});