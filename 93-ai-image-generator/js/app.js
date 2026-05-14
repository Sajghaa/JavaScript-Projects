// AI Image Generator - Complete Working Version
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
    let currentImageBlob = null;
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
                    showResult(image.url, image.prompt, image.model, image.blob);
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
    function showResult(imageUrl, prompt, model, blob = null) {
        generatedImage.src = imageUrl;
        usedPrompt.textContent = prompt;
        imageModel.textContent = model;
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
        currentImageUrl = imageUrl;
        currentImageBlob = blob;
        currentPrompt = prompt;
        currentModel = model;
        
        // Handle image load error
        generatedImage.onerror = () => {
            console.error('Image failed to load');
            showToast('Image loading failed. Please try regenerating.', 'error');
        };
    }
    
    // Show toast message
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // Generate image using multiple fallback APIs
    async function generateImage() {
        let prompt = promptInput.value.trim();
        if (!prompt) {
            showToast('Please enter a prompt', 'error');
            return;
        }
        
        const style = modelSelect.value;
        const quality = qualitySelect.value;
        const size = sizeSelect.value;
        
        // Enhance prompt with style
        let enhancedPrompt = prompt;
        const styleMap = {
            'anime': 'anime style, studio ghibli, vibrant colors',
            'digital-art': 'digital art, concept art, illustration',
            'oil-painting': 'oil painting, renaissance style, masterpiece',
            'watercolor': 'watercolor painting, soft colors, artistic',
            'sketch': 'pencil sketch, drawing, line art',
            'cyberpunk': 'cyberpunk, neon lights, futuristic city',
            'fantasy': 'fantasy art, magical, ethereal',
            'realistic': 'photorealistic, highly detailed, 4k'
        };
        
        if (styleMap[style]) {
            enhancedPrompt += `, ${styleMap[style]}`;
        }
        
        if (quality === 'high') {
            enhancedPrompt += ', 8k, ultra hd, masterpiece, award winning';
        }
        
        loadingOverlay.style.display = 'flex';
        
        try {
            // Method 1: Pollinations.ai
            const width = size;
            const height = size;
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
            
            // Test if image loads
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            const imageLoadPromise = new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image failed to load'));
                setTimeout(() => reject(new Error('Timeout')), 15000);
            });
            
            img.src = imageUrl;
            await imageLoadPromise;
            
            // Convert image to blob for gallery
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const localUrl = URL.createObjectURL(blob);
            
            showResult(localUrl, enhancedPrompt, style, blob);
            loadingOverlay.style.display = 'none';
            showToast('Image generated successfully!', 'success');
            
        } catch (error) {
            console.error('Pollinations error:', error);
            
            // Method 2: Use placeholder with canvas generation as fallback
            try {
                const canvas = document.createElement('canvas');
                canvas.width = parseInt(size);
                canvas.height = parseInt(size);
                const ctx = canvas.getContext('2d');
                
                // Create beautiful gradient background
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#8b5cf6');
                gradient.addColorStop(0.5, '#ec4899');
                gradient.addColorStop(1, '#f59e0b');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw shapes based on prompt
                ctx.fillStyle = 'white';
                ctx.font = `bold ${Math.floor(canvas.width / 15)}px Inter`;
                ctx.textAlign = 'center';
                ctx.fillText('🎨 AI Generated', canvas.width/2, canvas.height/2 - 60);
                
                ctx.font = `${Math.floor(canvas.width / 25)}px Inter`;
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                
                // Display prompt on image
                const displayPrompt = enhancedPrompt.length > 50 ? enhancedPrompt.substring(0, 50) + '...' : enhancedPrompt;
                ctx.fillText(displayPrompt, canvas.width/2, canvas.height/2 + 20);
                
                ctx.font = `${Math.floor(canvas.width / 35)}px Inter`;
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fillText('AI Image Generator', canvas.width/2, canvas.height/2 + 80);
                
                // Add decorative elements
                for (let i = 0; i < 30; i++) {
                    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 20 + 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const localUrl = URL.createObjectURL(blob);
                
                showResult(localUrl, enhancedPrompt, `${style} (Demo Mode)`, blob);
                loadingOverlay.style.display = 'none';
                showToast('Demo image generated (API unavailable). Try again later for AI images.', 'warning');
                
            } catch (fallbackError) {
                loadingOverlay.style.display = 'none';
                showToast('Failed to generate image. Please try again.', 'error');
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