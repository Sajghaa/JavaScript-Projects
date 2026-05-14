// ImageGenerator.js - Core image generation logic
class ImageGenerator {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.currentImage = null;
        this.currentPrompt = null;
        this.isGenerating = false;
    }
    
    async generate(prompt, style, quality, size) {
        if (this.isGenerating) {
            throw new Error('Already generating an image');
        }
        
        this.isGenerating = true;
        
        try {
            // Enhance prompt with style
            let enhancedPrompt = this.enhancePrompt(prompt, style);
            
            // Add quality enhancement
            const qualityLevel = quality === 'enhanced' ? 'enhanced' : 'standard';
            
            console.log('Generating with prompt:', enhancedPrompt);
            
            const imageUrl = await this.apiManager.generateImage(enhancedPrompt, {
                width: parseInt(size),
                height: parseInt(size),
                quality: qualityLevel,
                seed: Date.now()
            });
            
            this.currentImage = imageUrl;
            this.currentPrompt = enhancedPrompt;
            
            return {
                url: imageUrl,
                prompt: enhancedPrompt,
                style: style,
                quality: quality,
                size: size,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.isGenerating = false;
        }
    }
    
    enhancePrompt(prompt, style) {
        let enhanced = prompt;
        
        const styleModifiers = {
            'photorealistic': 'photorealistic, real photo, 4k, sharp focus',
            'digital-art': 'digital art, concept art, illustration, vibrant colors',
            'anime': 'anime style, anime art, japanese animation, ghibli style',
            'oil-painting': 'oil painting, renaissance, masterpiece, van gogh style',
            'watercolor': 'watercolor painting, soft colors, artistic, brush strokes',
            'sketch': 'pencil sketch, drawing, line art, charcoal',
            'cyberpunk': 'cyberpunk, futuristic, neon lights, blade runner style',
            'fantasy': 'fantasy art, magical, ethereal, dungeons and dragons'
        };
        
        if (styleModifiers[style]) {
            enhanced = `${enhanced}, ${styleModifiers[style]}`;
        }
        
        return enhanced;
    }
    
    getCurrentImage() {
        return this.currentImage;
    }
    
    getCurrentPrompt() {
        return this.currentPrompt;
    }
}

window.ImageGenerator = ImageGenerator;