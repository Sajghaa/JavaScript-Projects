// AI Image Generator - Real Image Generation
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
        
        // Handle image load error
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
    
    // Generate image using Pollinations.ai (Working URL format)
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
        
        // Style-specific enhancements
        const stylePrefixes = {
            'anime': 'anime style, anime art, japanese animation, ',
            'digital-art': 'digital art, concept art, illustration, ',
            'oil-painting': 'oil painting, renaissance painting, masterpiece, ',
            'watercolor': 'watercolor painting, watercolor art, ',
            'sketch': 'pencil sketch, drawing, line art, ',
            'cyberpunk': 'cyberpunk style, futuristic, neon lights, ',
            'fantasy': 'fantasy art, magical, ethereal, ',
            'realistic': 'photorealistic, real photo, 4k, highly detailed, '
        };
        
        if (stylePrefixes[style]) {
            enhancedPrompt = stylePrefixes[style] + enhancedPrompt;
        }
        
        if (quality === 'high') {
            enhancedPrompt += ', masterpiece, award winning, trending on artstation';
        }
        
        loadingOverlay.style.display = 'flex';
        
        try {
            // Pollinations.ai working URL format
            const width = size;
            const height = size;
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            
            // Use the correct Pollinations endpoint
            const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true`;
            
            console.log('Generating image with URL:', imageUrl);
            
            // Test if image loads
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            const imageLoadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('Image loaded successfully');
                    resolve(img);
                };
                img.onerror = (err) => {
                    console.error('Image load error:', err);
                    reject(new Error('Image failed to load'));
                };
                setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, 30000);
            });
            
            img.src = imageUrl;
            await imageLoadPromise;
            
            // Convert to blob for gallery
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
            
        } catch (error) {
            console.error('Generation error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Failed to generate image. Please try again with a different prompt.', 'error');
            
            // Fallback: Create a styled image with the prompt text
            createFallbackImage(enhancedPrompt, style, size);
        }
    }
    
    // Fallback: Create a styled placeholder with the prompt text
    function createFallbackImage(prompt, style, size) {
        const canvas = document.createElement('canvas');
        const width = parseInt(size);
        const height = parseInt(size);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create a beautiful gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw stars
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw a stylized icon based on style
        ctx.fillStyle = '#8b5cf6';
        ctx.font = `${Math.floor(width / 4)}px "Font Awesome 6 Free"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '🎨';
        if (style === 'anime') icon = '🎨';
        else if (style === 'digital-art') icon = '💻';
        else if (style === 'oil-painting') icon = '🖼️';
        else if (style === 'watercolor') icon = '🎨';
        else if (style === 'sketch') icon = '✏️';
        else if (style === 'cyberpunk') icon = '🤖';
        else if (style === 'fantasy') icon = '🐉';
        else icon = '🎨';
        
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.fillText(icon, width / 2, height / 2 - 50);
        
        // Draw the prompt text
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(width / 25)}px Inter`;
        ctx.textAlign = 'center';
        
        // Wrap long text
        const words = prompt.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width - 40 && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        const lineHeight = Math.floor(width / 20);
        const startY = height / 2 + 20;
        
        for (let i = 0; i < Math.min(lines.length, 4); i++) {
            ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
        }
        
        // Add AI attribution
        ctx.font = `${Math.floor(width / 35)}px Inter`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('AI Image Generator (Demo Mode)', width / 2, height - 20);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            showResult(url, prompt, `${style} (Demo Mode)`);
            showToast('Demo image generated (API unavailable). Try again later.', 'warning');
        }, 'image/png');
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