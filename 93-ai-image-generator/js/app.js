// AI Image Generator - Working with Real API
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveToGalleryBtn = document.getElementById('saveToGalleryBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const themeToggle = document.getElementById('themeToggle');
    const modelSelect = document.getElementById('modelSelect');
    const qualitySelect = document.getElementById('qualitySelect');
    const sizeSelect = document.getElementById('sizeSelect');
    const promptInput = document.getElementById('promptInput');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultSection = document.getElementById('resultSection');
    const generatedImage = document.getElementById('generatedImage');
    const usedPrompt = document.getElementById('usedPrompt');
    const imageModel = document.getElementById('imageModel');
    const toast = document.getElementById('toast');
    
    let gallery = [];
    let currentImageUrl = null;
    let currentPrompt = null;
    let currentModel = null;
    
    // Load gallery from localStorage
    function loadGallery() {
        const saved = localStorage.getItem('ai_gallery');
        if (saved) {
            gallery = JSON.parse(saved);
            renderGallery();
        }
    }
    
    // Save gallery to localStorage
    function saveGallery() {
        localStorage.setItem('ai_gallery', JSON.stringify(gallery));
        renderGallery();
    }
    
    // Render gallery
    function renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        const emptyGallery = document.getElementById('emptyGallery');
        
        if (gallery.length === 0) {
            galleryGrid.innerHTML = '';
            emptyGallery.style.display = 'block';
            return;
        }
        
        emptyGallery.style.display = 'none';
        galleryGrid.innerHTML = gallery.map((item, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="${item.url}" alt="Generated Image">
                <div class="gallery-item-actions">
                    <button class="gallery-item-delete" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.gallery-item-delete')) {
                    const index = parseInt(item.dataset.index);
                    const image = gallery[index];
                    showResult(image.url, image.prompt, image.model);
                }
            });
        });
        
        document.querySelectorAll('.gallery-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                gallery.splice(index, 1);
                saveGallery();
                showToast('Image removed from gallery', 'info');
            });
        });
    }
    
    // Show result
    function showResult(imageUrl, prompt, model) {
        generatedImage.src = imageUrl;
        usedPrompt.textContent = prompt;
        imageModel.textContent = model;
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
        currentImageUrl = imageUrl;
        currentPrompt = prompt;
        currentModel = model;
        
        generatedImage.onerror = () => {
            console.error('Image failed to load');
            showToast('Image failed to load. Please try again.', 'error');
        };
    }
    
    // Show toast message
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // Generate image using multiple free APIs
    async function generateImage() {
        let prompt = promptInput.value.trim();
        if (!prompt) {
            showToast('Please enter a prompt', 'error');
            return;
        }
        
        const style = modelSelect.value;
        const quality = qualitySelect.value;
        const size = sizeSelect.value;
        
        // Enhance prompt
        let enhancedPrompt = prompt;
        const styleSuffixes = {
            'anime': 'anime style, anime art style',
            'digital-art': 'digital art, digital painting',
            'oil-painting': 'oil painting style',
            'watercolor': 'watercolor painting style',
            'sketch': 'pencil sketch style',
            'cyberpunk': 'cyberpunk style, futuristic',
            'fantasy': 'fantasy art style',
            'realistic': 'photorealistic, real photo'
        };
        
        if (styleSuffixes[style]) {
            enhancedPrompt += `, ${styleSuffixes[style]}`;
        }
        
        if (quality === 'high') {
            enhancedPrompt += ', high quality, detailed, 4k';
        }
        
        loadingOverlay.style.display = 'flex';
        
        // Try multiple API endpoints
        const apis = [
            // API 1: Pollinations.ai (alternative format)
            {
                url: `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${size}&height=${size}&seed=${Date.now()}`,
                type: 'pollinations'
            },
            // API 2: Another free API
            {
                url: `https://api.waifu.pics/ai/image?prompt=${encodeURIComponent(enhancedPrompt)}`,
                type: 'waifu'
            }
        ];
        
        let success = false;
        
        for (const api of apis) {
            try {
                console.log(`Trying API: ${api.type}`);
                
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                const imageLoadPromise = new Promise((resolve, reject) => {
                    img.onload = () => {
                        console.log(`API ${api.type} succeeded`);
                        resolve(img);
                    };
                    img.onerror = () => reject(new Error(`API ${api.type} failed`));
                    setTimeout(() => reject(new Error(`API ${api.type} timeout`)), 15000);
                });
                
                img.src = api.url;
                await imageLoadPromise;
                
                // Convert to blob for storage
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const localUrl = URL.createObjectURL(blob);
                
                showResult(localUrl, enhancedPrompt, style);
                loadingOverlay.style.display = 'none';
                showToast('Image generated successfully!', 'success');
                success = true;
                break;
                
            } catch (error) {
                console.log(`API ${api.type} failed:`, error);
                continue;
            }
        }
        
        if (!success) {
            // Final fallback: Use Unsplash random images based on prompt keywords
            try {
                const keywords = prompt.split(' ').slice(0, 3).join(',');
                const unsplashUrl = `https://source.unsplash.com/featured/${size}x${size}/?${encodeURIComponent(keywords)}`;
                
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = unsplashUrl;
                    setTimeout(() => reject(new Error('Timeout')), 10000);
                });
                
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const localUrl = URL.createObjectURL(blob);
                
                showResult(localUrl, enhancedPrompt, `${style} (Stock Photo)`);
                loadingOverlay.style.display = 'none';
                showToast('Similar image found from stock photos', 'success');
                
            } catch (finalError) {
                loadingOverlay.style.display = 'none';
                showToast('Unable to generate image. Please try again.', 'error');
                console.error('All APIs failed:', finalError);
            }
        }
    }
    
    // Download image
    function downloadImage() {
        if (currentImageUrl) {
            const link = document.createElement('a');
            link.download = `ai-image-${Date.now()}.png`;
            link.href = currentImageUrl;
            link.click();
            showToast('Image downloaded!', 'success');
        }
    }
    
    // Save to gallery
    function saveToGallery() {
        if (currentImageUrl && currentPrompt && currentModel) {
            gallery.unshift({
                url: currentImageUrl,
                prompt: currentPrompt,
                model: currentModel,
                timestamp: new Date().toISOString()
            });
            saveGallery();
            showToast('Saved to gallery!', 'success');
        }
    }
    
    // Regenerate
    function regenerate() {
        generateBtn.click();
    }
    
    // Clear all gallery
    function clearGallery() {
        if (confirm('Delete all images from gallery?')) {
            gallery = [];
            saveGallery();
            showToast('Gallery cleared', 'info');
        }
    }
    
    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            promptInput.value = chip.textContent.trim();
            promptInput.focus();
        });
    });
    
    // Auto-resize textarea
    promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    // Theme toggle
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Event listeners
    generateBtn.addEventListener('click', generateImage);
    downloadBtn.addEventListener('click', downloadImage);
    saveToGalleryBtn.addEventListener('click', saveToGallery);
    regenerateBtn.addEventListener('click', regenerate);
    clearGalleryBtn.addEventListener('click', clearGallery);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Enter key to generate (Ctrl+Enter)
    promptInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateImage();
        }
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = themeToggle.querySelector('i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Load gallery
    loadGallery();
    
    console.log('AI Image Generator Ready!');
});