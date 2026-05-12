// ImageGenerator.js - Core image generation logic
class ImageGenerator {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.currentImage = null;
        this.currentPrompt = null;
        this.isGenerating = false;
    }

    async generateImage(prompt, model, style, quality, size) {
        if (this.isGenerating) {
            throw new Error('Already generating an image. Please wait.');
        }
        
        this.isGenerating = true;
        
        try {
            // Enhance prompt with style
            let enhancedPrompt = prompt.trim();
            if (style && style !== 'none') {
                enhancedPrompt = `${enhancedPrompt}, ${style} style`;
            }
            if (quality === 'enhanced') {
                enhancedPrompt += `, highly detailed, 4k, masterpiece, trending on ArtStation, award winning photograph`;
            }
            
            // Add quality descriptors
            enhancedPrompt += `, high quality, sharp focus, beautiful composition`;

            this.currentPrompt = enhancedPrompt;
            
            console.log('Generating with model:', model);
            console.log('Enhanced prompt:', enhancedPrompt);
            
            const imageUrl = await this.apiManager.generateImage(model, enhancedPrompt, { size });
            this.currentImage = imageUrl;
            
            return {
                url: imageUrl,
                prompt: enhancedPrompt,
                model: model,
                style: style,
                quality: quality,
                size: size,
                timestamp: new Date().toISOString()
            };
        } finally {
            this.isGenerating = false;
        }
    }

    getCurrentImage() {
        return this.currentImage;
    }

    getCurrentPrompt() {
        return this.currentPrompt;
    }
}

window.ImageGenerator = ImageGenerator;