// Chatbot Engine - Natural Language Processing
class Chatbot {
    constructor() {
        this.context = {
            lastIntent: null,
            lastTopic: null,
            conversationHistory: []
        };
        this.isProcessing = false;
    }
    
    // Process user message and generate response
    async processMessage(message) {
        this.isProcessing = true;
        
        // Simulate thinking delay
        await this.delay(500);
        
        // Preprocess message
        const processedMessage = this.preprocessMessage(message);
        
        // Check for math calculation
        if (this.isMathQuestion(processedMessage)) {
            const result = this.solveMath(processedMessage);
            this.isProcessing = false;
            return result;
        }
        
        // Determine intent
        const intent = this.detectIntent(processedMessage);
        
        // Generate response based on intent
        const response = this.generateResponse(intent, processedMessage);
        
        // Update context
        this.updateContext(intent, message);
        
        this.isProcessing = false;
        return response;
    }
    
    // Preprocess message (lowercase, remove punctuation, etc.)
    preprocessMessage(message) {
        return message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim();
    }
    
    // Check if message contains a math question
    isMathQuestion(message) {
        const mathKeywords = ['calculate', 'what is', 'equals', 'solve', 'compute', '+', '-', '*', '/', 'times', 'divided by', 'plus', 'minus'];
        return mathKeywords.some(keyword => message.includes(keyword)) || /[\d+\-*/]/.test(message);
    }
    
    // Solve math expressions
    solveMath(message) {
        // Extract numbers and operations
        const mathRegex = /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/;
        const match = message.match(mathRegex);
        
        if (match) {
            const num1 = parseFloat(match[1]);
            const operator = match[2];
            const num2 = parseFloat(match[3]);
            
            let result;
            switch(operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : "Cannot divide by zero"; break;
                default: return "I couldn't calculate that. Please use format like '5 + 3'";
            }
            
            if (typeof result === 'number') {
                return `${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
            }
            return result;
        }
        
        // Check for words
        const wordMath = message.match(/(\d+(?:\.\d+)?)\s*(plus|minus|times|divided by)\s*(\d+(?:\.\d+)?)/);
        if (wordMath) {
            const num1 = parseFloat(wordMath[1]);
            const operation = wordMath[2];
            const num2 = parseFloat(wordMath[3]);
            
            let result;
            switch(operation) {
                case 'plus': result = num1 + num2; break;
                case 'minus': result = num1 - num2; break;
                case 'times': result = num1 * num2; break;
                case 'divided by': result = num2 !== 0 ? num1 / num2 : "Cannot divide by zero"; break;
                default: return "I couldn't calculate that.";
            }
            
            if (typeof result === 'number') {
                return `${num1} ${operation} ${num2} = ${result.toFixed(2)}`;
            }
            return result;
        }
        
        return "I can help with math! Try saying 'calculate 15 * 8' or 'what is 100 divided by 4'";
    }
    
    // Detect intent from message
    detectIntent(message) {
        // Check specific responses first
        for (const [key, data] of Object.entries(window.specificResponses || {})) {
            for (const pattern of data.patterns) {
                if (message.includes(pattern)) {
                    return { type: 'specific', key: key };
                }
            }
        }
        
        // Check training data intents
        for (const [intent, data] of Object.entries(window.trainingData)) {
            if (data.patterns && Array.isArray(data.patterns)) {
                for (const pattern of data.patterns) {
                    if (message.includes(pattern)) {
                        return { type: 'intent', intent: intent, data: data };
                    }
                }
            }
        }
        
        // Check for context-based responses
        if (this.context.lastIntent) {
            // Respond based on previous conversation context
            return { type: 'context', intent: 'followup' };
        }
        
        return { type: 'unknown' };
    }
    
    // Generate response based on intent
    generateResponse(intent, originalMessage) {
        if (intent.type === 'specific') {
            const specificData = window.specificResponses[intent.key];
            if (specificData && specificData.response) {
                return specificData.response;
            }
        }
        
        if (intent.type === 'intent') {
            const data = intent.data;
            if (data.responses && Array.isArray(data.responses)) {
                const randomIndex = Math.floor(Math.random() * data.responses.length);
                return data.responses[randomIndex];
            }
        }
        
        if (intent.type === 'context') {
            // Context-aware responses
            if (this.context.lastIntent === 'recommendations') {
                return "Could you be more specific about what you'd like recommendations for? Movies, books, music, or food?";
            }
            if (this.context.lastIntent === 'weather') {
                return "I wish I could check the weather for you! Unfortunately, I don't have live weather data access.";
            }
            return "I see! Is there anything specific you'd like to know about that?";
        }
        
        // Fallback responses
        const fallbackResponses = window.trainingData.fallback || [
            "I'm not sure I understand. Could you rephrase that?",
            "Interesting! Could you tell me more about that?",
            "I'm still learning! How about we talk about something else?",
            "Let me think about that... In the meantime, is there something else I can help with?"
        ];
        
        const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
        return fallbackResponses[randomIndex];
    }
    
    // Update conversation context
    updateContext(intent, message) {
        this.context.lastIntent = intent.type === 'intent' ? intent.intent : null;
        this.context.conversationHistory.push({
            message: message,
            intent: this.context.lastIntent,
            timestamp: new Date()
        });
        
        // Keep only last 10 messages
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }
    }
    
    // Simple delay for realistic response time
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Reset conversation context
    resetContext() {
        this.context = {
            lastIntent: null,
            lastTopic: null,
            conversationHistory: []
        };
    }
}

// Initialize chatbot
window.chatbot = new Chatbot();