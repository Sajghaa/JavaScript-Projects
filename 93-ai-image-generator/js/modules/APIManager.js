// APIManager.js - Handles API calls to Pollinations.ai (Working, Free, No Key)
class APIManager {
    constructor() {
        this.baseUrl = 'https://image.pollinations.ai/prompt/';
    }

    async generateImage(prompt, options = {}) {
        const { width = 768, height = 768, seed = Date.now() } = options;
        
        // Enhance prompt for better results
        let enhancedPrompt = prompt;
        
        // Add quality modifiers
        if (options.quality === 'enhanced') {
            enhancedPrompt += ', masterpiece, highly detailed, 4k, award winning';
        }
        
        // Encode the prompt for URL
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        
        // Pollinations.ai URL format - works reliably
        const imageUrl = `${this.baseUrl}${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
        
        console.log('Generating image with URL:', imageUrl);
        
        // Test if the image loads
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
                console.log('Image loaded successfully');
                resolve(imageUrl);
            };
            img.onerror = (error) => {
                console.error('Image load error:', error);
                reject(new Error('Failed to generate image'));
            };
            setTimeout(() => reject(new Error('Request timeout')), 30000);
        });
        
        img.src = imageUrl;
        await loadPromise;
        
        return imageUrl;
    }
    
    async testConnection() {
        try {
            const testUrl = 'https://image.pollinations.ai/prompt/test?width=64&height=64';
            const response = await fetch(testUrl, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}

window.APIManager = APIManager;