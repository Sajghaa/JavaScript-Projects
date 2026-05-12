class APIManager {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://api-inference.huggingface.co/models/';
        this.loadApiKey();
    }

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('hf_api_key', key);
    }

    loadApiKey() {
        const savedKey = localStorage.getItem('hf_api_key');
        if (savedKey) {
            this.apiKey = savedKey;
        }
        return this.apiKey;
    }

    async generateImage(modelId, prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key is required. Please add your Hugging Face API key.');
        }

        // Different models need different parameter formats
        const isSDXL = modelId.includes('stable-diffusion-xl');
        
        const payload = {
            inputs: prompt,
            parameters: {
                negative_prompt: options.negativePrompt || 'blurry, ugly, duplicate, poorly drawn, bad anatomy',
                num_inference_steps: options.steps || (isSDXL ? 25 : 20),
                guidance_scale: options.guidance || 7.5,
                width: this.getWidth(options.size || '512x512'),
                height: this.getHeight(options.size || '512x512'),
            }
        };

        try {
            const response = await fetch(`${this.apiUrl}${modelId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Handle model loading status
                if (response.status === 503) {
                    const estimatedTime = errorData.estimated_time || 20;
                    throw new Error(`Model is loading. Please wait ${estimatedTime} seconds and try again.`);
                }
                
                // Handle authentication errors
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Hugging Face token.');
                }
                
                // Handle rate limiting
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                
                throw new Error(errorData.error || `API Error: ${response.status}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    getWidth(size) {
        const sizes = {
            '512x512': 512,
            '768x768': 768,
            '1024x1024': 1024
        };
        return sizes[size] || 512;
    }

    getHeight(size) {
        const sizes = {
            '512x512': 512,
            '768x768': 768,
            '1024x1024': 1024
        };
        return sizes[size] || 512;
    }

    async checkModelStatus(modelId) {
        try {
            const response = await fetch(`${this.apiUrl}${modelId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

window.APIManager = APIManager;