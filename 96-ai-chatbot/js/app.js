// Main Application - Chatbot UI
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const helpBtn = document.getElementById('helpBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Send message on Enter (Shift+Enter for new line)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Clear chat
    clearChatBtn.addEventListener('click', () => {
        if (confirm('Clear all messages?')) {
            chatMessages.innerHTML = '';
            addWelcomeMessage();
            window.chatbot.resetContext();
        }
    });
    
    // Help button
    helpBtn.addEventListener('click', () => {
        addBotMessage("Here's what I can help with:\n\n• Answer general questions\n• Tell jokes\n• Math calculations (e.g., '15 * 8')\n• Recommendations for movies, books, music, food\n• General conversation\n\nJust type naturally and I'll do my best to understand!");
    });
    
    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent;
            sendMessage();
        });
    });
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addUserMessage(message);
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Get bot response
            const response = await window.chatbot.processMessage(message);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response
            addBotMessage(response);
            
            // Scroll to bottom
            scrollToBottom();
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addBotMessage("Sorry, I encountered an error. Please try again.");
        }
    }
    
    function addUserMessage(message) {
        const messageDiv = createMessageElement(message, 'user');
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function addBotMessage(message) {
        const messageDiv = createMessageElement(message, 'bot');
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function addWelcomeMessage() {
        const welcomeMessage = "Hello! I'm your AI assistant. I can help you with:\n• General questions and answers\n• Jokes and fun facts\n• Math calculations\n• Weather information\n• Recommendations\n• And much more!\n\nWhat would you like to talk about?";
        addBotMessage(welcomeMessage);
    }
    
    function createMessageElement(message, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${formatMessage(message)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        return div;
    }
    
    function formatMessage(message) {
        // Convert URLs to links
        let formatted = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Convert markdown-style lists
        formatted = formatted.replace(/• /g, '<br>• ');
        
        return formatted;
    }
    
    function showTypingIndicator() {
        typingIndicator.classList.add('active');
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        typingIndicator.classList.remove('active');
    }
    
    function scrollToBottom() {
        const container = document.querySelector('.chat-messages');
        container.scrollTop = container.scrollHeight;
    }
    
    // Add welcome message on load
    if (chatMessages.children.length === 0) {
        addWelcomeMessage();
    }
});

// Global function for console testing
window.testChatbot = async function(message) {
    const response = await window.chatbot.processMessage(message);
    console.log(`User: ${message}`);
    console.log(`Bot: ${response}`);
    return response;
};

console.log('AI Chatbot Ready! Test it by typing: testChatbot("hello")');